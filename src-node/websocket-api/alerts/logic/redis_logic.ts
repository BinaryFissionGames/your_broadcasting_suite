import {promisify} from 'util';
import redisClient, {pubSubRedisClient} from '../../../model/redis';
import {connection} from 'websocket';
import {
    getAlertClientSetCompletedKey,
    getAlertClientSetKey,
    getAlertClientSetValue,
    getAlertQueueSubKey,
    getCurrentAlertIdKey
} from './redis_keys';
import {convertToAlertType, getFirstUncompletedQueueItem, markQueueItemAsDone} from './logic';
import {AlertSocket} from '../types/websocket_types';
import {knex} from '../../../model/knex';
import {AlertMessageType, EmitNextAlertMessage} from '../../../model/messages/types';
import {QueueItem} from '@prisma/client';

export let queueIdToConnectionsMap = new Map<number, connection[]>();

export async function addAlertConnection(queueId: number, conn: connection): Promise<void> {
    let socket = <AlertSocket>conn.socket;

    let connectionAdded: boolean = false;
    while(!connectionAdded){
        connectionAdded = await tryAddAlertToConnectionSet(queueId, socket)
    }

    if (queueIdToConnectionsMap.has(queueId)) {
        queueIdToConnectionsMap.get(queueId).push(conn);
    } else {
        queueIdToConnectionsMap.set(queueId, [conn]);

        let subscribe = promisify(pubSubRedisClient.subscribe.bind(pubSubRedisClient));
        await subscribe(getAlertQueueSubKey(queueId));
    }
}

//Try adding the alert to the connection set. This also may update the current queue item, if there isn't one set and this is the first
//connection added to the set. Returns false if the optimistic lock failed. Returns true if the operation was successful.
async function tryAddAlertToConnectionSet(queueId: number, socket: AlertSocket): Promise<boolean>{
    return new Promise((resolve, reject) => {
        let client = redisClient.duplicate();
        client.WATCH(getAlertClientSetKey(queueId), getCurrentAlertIdKey(queueId), async (err, res) => {
            try{
                if(err){
                    throw err;
                }

                let get = promisify(client.get.bind(client));
                let scard = promisify(client.scard.bind(client));

                let multiCommand = client.multi();

                let setSize: number = await scard(getAlertClientSetKey(queueId));

                if(setSize == 0){
                    let currentAlert = await get(getCurrentAlertIdKey(queueId));
                    if(!currentAlert){
                        //No current alert, AND there are no listening clients, so we'll need to set the current queue item
                        let queueItem = await getFirstUncompletedQueueItem(queueId);
                        if(queueItem){
                            multiCommand = multiCommand.set(getCurrentAlertIdKey(queueId), queueItem.id.toFixed(0));
                        }
                    }
                }

                multiCommand = multiCommand.sadd(getAlertClientSetKey(queueId),
                    getAlertClientSetValue(Number.parseInt(process.env.SERVER_NODE), Number.parseInt(process.env.PROCESS_IN_CLUSTER), queueId, socket.connectionId))

                let exec = promisify(multiCommand.exec.bind(multiCommand));
                let resp = await exec();

                if(resp === null){
                    //Watch failed
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            } catch (e) {
                return reject(e);
            } finally {
                client.quit();
            }
        });
    });
}


export async function removeAlertConnection(queueId: number, conn: connection): Promise<void> {
    let srem = promisify(redisClient.SREM.bind(redisClient));
    let socket = <AlertSocket>conn.socket;

    await srem(getAlertClientSetKey(queueId), getAlertClientSetValue(Number.parseInt(process.env.SERVER_NODE), Number.parseInt(process.env.PROCESS_IN_CLUSTER), queueId, socket.connectionId));

    let connections = queueIdToConnectionsMap.get(queueId);
    if (connections) {
        let updatedConnections = connections.filter((item) => item !== conn);
        if (updatedConnections.length === 0) {
            queueIdToConnectionsMap.delete(queueId);

            let unsub = promisify(pubSubRedisClient.unsubscribe.bind(pubSubRedisClient));
            await unsub(getAlertQueueSubKey(queueId));
        } else {
            queueIdToConnectionsMap.set(queueId, updatedConnections);
        }
    }
}

export async function markAlertDoneForConnection(queueId: number, connId: string): Promise<void> {
    let sadd = promisify(redisClient.SADD.bind(redisClient));
    await sadd(getAlertClientSetCompletedKey(queueId), getAlertClientSetValue(Number.parseInt(process.env.SERVER_NODE), Number.parseInt(process.env.PROCESS_IN_CLUSTER), queueId, connId));
}

//Check if connection set = alert done set, and publish the next alert
//Returns true if the check was successful (all alerts where confirmed)
export async function checkAndPublishNextAlert(queueId: number): Promise<boolean> {
    let client = redisClient.duplicate();
    //Watch both completed set & client set, both of these must match. If either is changed, then the process/thread/fiber that changed them
    //Must check instead.
    let sdiff = promisify(client.sdiff.bind(client));
    let scard = promisify(client.scard.bind(client));
    let unwatch = promisify(client.unwatch.bind(client));
    let get = promisify(client.get.bind(client));

    return new Promise((resolve, reject) => {
        client.watch(getAlertClientSetCompletedKey(queueId), getAlertClientSetKey(queueId), async (err, res) => {
            try {
                let setDifference: string[] = await sdiff(getAlertClientSetKey(queueId), getAlertClientSetCompletedKey(queueId));

                if (setDifference.length >= 1) {
                    console.debug('Set difference is gt 1')
                    return unwatch();
                }

                let numConnectedClients: number = await scard(getAlertClientSetKey(queueId));
                if (numConnectedClients == 0) {
                    return unwatch(); // No clients connected; Thus, we shouldn't mark this alert as done, as it may not have been seen yet.
                }

                // We need to mark the current alertId as done, look up the next alert ID, (transactionally),
                //Then we need to clear the alert completed set, and set the current alert ID.
                // We should rollback the alert DB transaction if the watch fails.

                let alertId = await get(getCurrentAlertIdKey(queueId));
                let trx = await knex.transaction();

                try {
                    console.log('marking queue item as done');
                    await markQueueItemAsDone(alertId, trx);
                    console.log('Getting next item');
                    let nextQueueItem = await getFirstUncompletedQueueItem(queueId, trx);

                    let multiCommand = client.MULTI()
                        .DEL(getAlertClientSetCompletedKey(queueId));
                    if (nextQueueItem) {
                        let websocketAlert = await getPushAlertMessageToPublish(nextQueueItem);
                        multiCommand = multiCommand.SET(getCurrentAlertIdKey(queueId), nextQueueItem.id.toFixed(0)).PUBLISH(getAlertQueueSubKey(queueId), JSON.stringify(websocketAlert));
                    } else {
                        multiCommand = multiCommand.DEL(getCurrentAlertIdKey(queueId));
                    }

                    let exec = promisify(multiCommand.exec.bind(multiCommand));

                    let execResult: any[] = await exec();

                    if (execResult === null) {
                        //Couldn't EXEC redis transaction, rollback, let whoever changed our watched keys deal w/ this.
                        console.log('Exec failed.');
                        await trx.rollback();
                        return resolve(false);
                    } else {
                        console.log('Exec worked!');
                        await trx.commit();
                        return resolve(true);
                    }
                } catch (e) {
                    if (!trx.isCompleted) {
                        await trx.rollback();
                    }
                    throw e;
                }
            } catch (e) {
                reject(e);
            } finally {
                client.quit();
            }
        });
    });
}

export async function getCurrentAlertId(queueId: number): Promise<number | undefined> {
    let get: (string) => Promise<string | undefined> = promisify(redisClient.GET.bind(redisClient));
    let res = await get(getCurrentAlertIdKey(queueId));
    if (res) {
        return Number.parseInt(res);
    }

    return undefined;
}

export async function getPushAlertMessageToPublish(queueItem: QueueItem) {
    let websocketAlert: EmitNextAlertMessage = {
        type: AlertMessageType.EMIT_NEXT_ALERT,
        queueItemId: queueItem.id,
        queueItemAlert: await convertToAlertType(queueItem)
    };

    return websocketAlert;
}