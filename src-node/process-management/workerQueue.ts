import {
    PROCESS_CLEANUP_QUEUE_NAME,
    PROCESS_STALLED_TIME_S,
    WEBSOCKET_CONNECTION_CLEANUP_QUEUE_NAME,
    WEBSOCKET_GRACEFUL_CLOSE_REMOVAL_TIME_S,
} from '../constants';
import * as Bull from 'bull';
import {RemoveConnectionIdMessage} from './types';
import redisClient from '../model/redis';
import {checkAndPublishNextAlert} from '../websocket-api/alerts/logic/redis_logic';
import {promisify} from 'util';
import {getAlertClientSetKey} from '../websocket-api/alerts/logic/redis_keys';

const processCleanupWorkerQueue = new Bull(PROCESS_CLEANUP_QUEUE_NAME, process.env.REDIS_URL, {
    defaultJobOptions: {
        delay: PROCESS_STALLED_TIME_S * 1000,
    },
});

const processDisconnectWorkerQueue = new Bull(WEBSOCKET_CONNECTION_CLEANUP_QUEUE_NAME, process.env.REDIS_URL, {
    defaultJobOptions: {
        delay: WEBSOCKET_GRACEFUL_CLOSE_REMOVAL_TIME_S * 1000,
    },
});

processCleanupWorkerQueue.on('stalled', console.error);
processDisconnectWorkerQueue.on('stalled', console.error);

processDisconnectWorkerQueue.process(async (job: Bull.Job) => {
    const message: RemoveConnectionIdMessage = JSON.parse(job.data);
    const srem = promisify(redisClient.SREM.bind(redisClient));

    await srem(getAlertClientSetKey(message.queueId), message.connectionId);
    //Removing this connection may trigger the next message.
    await checkAndPublishNextAlert(message.queueId);
});

export async function shutdownQueueWorkers() {
    await processCleanupWorkerQueue.close();
    await processDisconnectWorkerQueue.close();
}

export {processCleanupWorkerQueue, processDisconnectWorkerQueue};
