import {promisify} from 'util';
import redisClient, {pubSubRedisClient} from '../../../model/redis';
import {connection} from 'websocket';
import {
    getAlertClientSetCompletedKey,
    getAlertClientSetKey,
    getAlertQueueSubKey,
    getCurrentAlertIdKey,
    getProcessConnectionIdsForQueueKey,
    getProcessQueuesKey,
} from './redis_keys';
import {convertToAlertType, getFirstUncompletedQueueItem, markQueueItemAsDone} from './logic';
import {AlertSocket} from '../types/websocket_types';
import {knex} from '../../../model/knex';
import {AlertMessageType, EmitNextAlertMessage} from '../../../model/messages/types';
import {QueueItem} from '@prisma/client';
import {logger} from '../../../logging';

export const queueIdToConnectionsMap = new Map<number, connection[]>();

export async function addAlertConnection(queueId: number, conn: connection): Promise<void> {
    const socket = <AlertSocket>conn.socket;

    let connectionAdded = false;
    while (!connectionAdded) {
        connectionAdded = await tryAddAlertToConnectionSet(queueId, socket);
    }

    if (queueIdToConnectionsMap.has(queueId)) {
        queueIdToConnectionsMap.get(queueId).push(conn);
    } else {
        queueIdToConnectionsMap.set(queueId, [conn]);

        const subscribe = promisify(pubSubRedisClient.subscribe.bind(pubSubRedisClient));
        await subscribe(getAlertQueueSubKey(queueId));
    }
}

//Try adding the alert to the connection set. This also may update the current queue item, if there isn't one set and this is the first
//connection added to the set. Returns false if the optimistic lock failed. Returns true if the operation was successful.
async function tryAddAlertToConnectionSet(queueId: number, socket: AlertSocket): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const client = redisClient.duplicate();
        client.WATCH(getAlertClientSetKey(queueId), getCurrentAlertIdKey(queueId), async (err, _res) => {
            try {
                if (err) {
                    throw err;
                }

                const get = promisify(client.get.bind(client));
                const scard = promisify(client.scard.bind(client));

                let multiCommand = client.multi();

                const setSize: number = await scard(getAlertClientSetKey(queueId));

                if (setSize == 0) {
                    const currentAlert = await get(getCurrentAlertIdKey(queueId));
                    if (!currentAlert) {
                        //No current alert, AND there are no listening clients, so we'll need to set the current queue item
                        const queueItem = await getFirstUncompletedQueueItem(queueId);
                        if (queueItem) {
                            multiCommand = multiCommand.set(getCurrentAlertIdKey(queueId), queueItem.id.toFixed(0));
                        }
                    }
                }

                multiCommand = multiCommand
                    .sadd(getAlertClientSetKey(queueId), socket.connectionId)
                    .sadd(getProcessQueuesKey(process.env.PROCESS_ID), queueId.toFixed(0))
                    .sadd(getProcessConnectionIdsForQueueKey(queueId, process.env.PROCESS_ID));

                const exec = promisify(multiCommand.exec.bind(multiCommand));
                const resp = await exec();

                if (resp === null) {
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
    const srem = promisify(redisClient.SREM.bind(redisClient));
    const socket = <AlertSocket>conn.socket;

    await srem(getAlertClientSetKey(queueId), socket.connectionId);

    const connections = queueIdToConnectionsMap.get(queueId);
    if (connections) {
        const updatedConnections = connections.filter((item) => item !== conn);
        if (updatedConnections.length === 0) {
            queueIdToConnectionsMap.delete(queueId);

            const unsub = promisify(pubSubRedisClient.unsubscribe.bind(pubSubRedisClient));
            await unsub(getAlertQueueSubKey(queueId));

            //Process is no longer associated w/ queue
            await srem(getProcessQueuesKey(process.env.PROCESS_ID), queueId.toFixed(0));
        } else {
            queueIdToConnectionsMap.set(queueId, updatedConnections);
        }

        //Process is no longer associated w/ connection.
        await srem(getProcessConnectionIdsForQueueKey(queueId, process.env.PROCESS_ID), socket.connectionId);
    }
}

export async function markAlertDoneForConnection(queueId: number, connId: string): Promise<void> {
    const sadd = promisify(redisClient.SADD.bind(redisClient));
    await sadd(getAlertClientSetCompletedKey(queueId), connId);
}

//Check if connection set = alert done set, and publish the next alert
//Returns true if the check was successful (all alerts where confirmed)
export async function checkAndPublishNextAlert(queueId: number): Promise<boolean> {
    const client = redisClient.duplicate();
    //Watch both completed set & client set, both of these must match. If either is changed, then the process/thread/fiber that changed them
    //Must check instead.
    const sdiff = promisify(client.sdiff.bind(client));
    const scard = promisify(client.scard.bind(client));
    const unwatch = promisify(client.unwatch.bind(client));
    const get = promisify(client.get.bind(client));
    const methodLogger = logger.child({file: __filename, method: 'checkAndPublishNextAlert'});
    return new Promise((resolve, reject) => {

        client.watch(getAlertClientSetCompletedKey(queueId), getAlertClientSetKey(queueId), async (err, _res) => {
            try {
                if (err) {
                    throw err;
                }

                const setDifference: string[] = await sdiff(
                    getAlertClientSetKey(queueId),
                    getAlertClientSetCompletedKey(queueId)
                );

                if (setDifference.length >= 1) {
                    methodLogger.debug('Set difference is gt 1');
                    return unwatch();
                }

                const numConnectedClients: number = await scard(getAlertClientSetKey(queueId));
                if (numConnectedClients == 0) {
                    return unwatch(); // No clients connected; Thus, we shouldn't mark this alert as done, as it may not have been seen yet.
                }

                // We need to mark the current alertId as done, look up the next alert ID, (transactionally),
                //Then we need to clear the alert completed set, and set the current alert ID.
                // We should rollback the alert DB transaction if the watch fails.

                const alertId = await get(getCurrentAlertIdKey(queueId));
                const trx = await knex.transaction();

                try {
                    methodLogger.debug('marking queue item as done');
                    await markQueueItemAsDone(alertId, trx);
                    methodLogger.debug('Getting next item');
                    const nextQueueItem = await getFirstUncompletedQueueItem(queueId, trx);

                    let multiCommand = client.MULTI().DEL(getAlertClientSetCompletedKey(queueId));
                    if (nextQueueItem) {
                        const websocketAlert = await getPushAlertMessageToPublish(nextQueueItem);
                        multiCommand = multiCommand
                            .SET(getCurrentAlertIdKey(queueId), nextQueueItem.id.toFixed(0))
                            .PUBLISH(getAlertQueueSubKey(queueId), JSON.stringify(websocketAlert));
                    } else {
                        multiCommand = multiCommand.DEL(getCurrentAlertIdKey(queueId));
                    }

                    const exec = promisify(multiCommand.exec.bind(multiCommand));

                    const execResult = await exec();

                    if (execResult === null) {
                        //Couldn't EXEC redis transaction, rollback, let whoever changed our watched keys deal w/ this.
                        //Possible TODO: don't use transactions, use some more performant method. (e.g. make get first uncompleted queue item ignore current queue item)
                        methodLogger.debug('Exec failed.');
                        await trx.rollback();
                        return resolve(false);
                    } else {
                        methodLogger.debug('Exec worked!');
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
    const get: (string) => Promise<string | undefined> = promisify(redisClient.GET.bind(redisClient));
    const res = await get(getCurrentAlertIdKey(queueId));
    if (res) {
        return Number.parseInt(res);
    }

    return undefined;
}

export async function getPushAlertMessageToPublish(queueItem: QueueItem) {
    const websocketAlert: EmitNextAlertMessage = {
        type: AlertMessageType.EMIT_NEXT_ALERT,
        queueItemId: queueItem.id,
        queueItemAlert: await convertToAlertType(queueItem),
    };

    return websocketAlert;
}
