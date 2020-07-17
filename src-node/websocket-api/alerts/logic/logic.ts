import {QueueItem} from '@prisma/client';
import {prisma} from '../../../model/prisma';
import {promisify} from 'util';
import {connection, IStringified} from 'websocket';
import {getCurrentAlertId, queueIdToConnectionsMap} from './redis_logic';
import {
    AlertMessageType,
    AlertType,
    GenericAlert, GenericAlertMessage,
    QueueItemTypes,
    SendAlertMessage,
    TextAlert
} from 'twitch_broadcasting_suite_shared/dist';
import * as Knex from 'knex';
import {knex} from '../../../model/knex';

export async function isCodeValidForQueue(code: string, queueId: number): Promise<boolean> {
    let queue = await prisma.queue.findOne({
        where: {
            id: queueId,
        }
    });
    return queue && queue.secret === code;
}

export async function getFirstUncompletedQueueItem(queueId: number, trx?: Knex.Transaction): Promise<QueueItem | undefined> {
    let queryBuilder = trx || knex;

    let result = await queryBuilder<QueueItem>('QueueItem').where('queueId', queueId).andWhere('completionDate', null).orderBy('id', 'asc').limit(1).select();

    return result[0];
}

export async function getCurrentQueueItem(queueId: number): Promise<QueueItem | null> {
    let itemId = await getCurrentAlertId(queueId);
    if(!itemId){
        return null;
    }

    return prisma.queueItem.findOne({
        where: {
            id: itemId
        }
    });
}

export async function markQueueItemAsDone(queueItemId: number, trx?: Knex.Transaction): Promise<void> {
    let queryBuilder = trx || knex;

    await queryBuilder('QueueItem').where('id', queueItemId).update('completionDate', new Date());
}

export async function emitToAllForQueue(queueId: number, message: GenericAlertMessage): Promise<void> {
    let connections = queueIdToConnectionsMap.get(queueId);
    let stringifiedMessage = JSON.stringify(message);
    let promises = [];
    for (let connection of connections) {
        let asyncSend: (IStringified) => Promise<void> = promisify(connection.sendUTF.bind(connection));
        promises.push(asyncSend(stringifiedMessage));
    }

    await Promise.all(promises);
}

export async function sendAlertToClient(queueItem: QueueItem, conn: connection): Promise<void> {
    let alert = await convertToAlertType(queueItem);
    let alertMessage: SendAlertMessage = {
        id: queueItem.id,
        alert,
        type: AlertMessageType.DISPLAY_ALERT
    };

    let sendUtf: (IStringified) => Promise<void>  = promisify(conn.sendUTF.bind(conn));
    return sendUtf(JSON.stringify(alertMessage));
}

export async function convertToAlertType(queueItem: QueueItem): Promise<GenericAlert> {
    switch (<QueueItemTypes>queueItem.type) {
        case QueueItemTypes.FOLLOWS_NOTIFICATION: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        case QueueItemTypes.SUBSCRIBER_NOTIFICATION: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        case QueueItemTypes.RAID_NOTIFICATION: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        case QueueItemTypes.BITS_NOTIFICATION: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        case QueueItemTypes.DONATION_NOTIFICATION: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        case QueueItemTypes.YOUTUBE_VIDEO: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
        default: {
            let notif: TextAlert = {
                type: AlertType.TEXT_ALERT,
                text: queueItem.description
            };
            return notif;
        }
    }
}


