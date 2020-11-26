import {processCleanupWorkerQueue} from './workerQueue';
import * as Bull from 'bull';
import {PROCESS_STALL_TIMER_UPKEEP_TIME_S} from '../constants';
import redisClient from '../model/redis';
import {promisify} from 'util';
import {
    getAlertClientSetCompletedKey,
    getAlertClientSetKey,
    getProcessConnectionIdsForQueueKey,
    getProcessQueuesKey,
} from '../websocket-api/alerts/logic/redis_keys';
import {shutdownGracefully} from '../shutdown';
import {getProcessCleanupJobIdKey} from './redis_keys';
import {logger} from '../logging';

let currentJob: Bull.Job;
let upkeepInterval: NodeJS.Timeout;

export async function initProcessUpkeep(processId: string) {
    const get = promisify(redisClient.get.bind(redisClient));
    const set = promisify(redisClient.set.bind(redisClient));
    const methodLogger = logger.child({file: __filename, method: 'initProcessUpkeep'});

    const oldJobId: string = await get(getProcessCleanupJobIdKey(processId));
    if (oldJobId) {
        const oldJob = await processCleanupWorkerQueue.getJob(oldJobId);
        if (oldJob) {
            await oldJob.takeLock();
            if (await oldJob.isCompleted()) {
                //process was cleaned up by another process
                methodLogger.warn(`Process ${processId} was cleaned up by another process!`);
            } else {
                methodLogger.warn(`Process ${processId} exited unsuccessfully last time, cleaning up old process...`);
                await cleanupProcess(processId);
            }
            await oldJob.discard();
        }
    }

    currentJob = await processCleanupWorkerQueue.add(processId);

    await set(getProcessCleanupJobIdKey(processId), currentJob.id);

    upkeepInterval = setInterval(async () => {
        try {
            if (currentJob) {
                await currentJob.takeLock();
                if (await currentJob.isCompleted()) {
                    methodLogger.error('Failed to keep up, and process was cleaned up! Closing down process...');
                    currentJob = null;
                    await shutdownGracefully();
                } else {
                    const newJob = await processCleanupWorkerQueue.add(processId);
                    await currentJob.discard();
                    currentJob = newJob;
                    await set(getProcessCleanupJobIdKey(processId), currentJob.id);
                }
            }
        } catch (e) {
            methodLogger.error(e);
        }
    }, PROCESS_STALL_TIMER_UPKEEP_TIME_S * 1000);

    processCleanupWorkerQueue.process(async (job: Bull.Job) => {
        const cleanupProcessId = job.data;
        methodLogger.error('Got cleanup job for process ' + cleanupProcessId + ', process must be dead!');
        await cleanupProcess(cleanupProcessId);
    });
}

export async function shutdownProcessUpkeep() {
    const methodLogger = logger.child({file: __filename, method: 'shutdownProcessUpkeep'});
    methodLogger.info('shutting down process upkeep')
    if (currentJob) {
        methodLogger.info('current upkeep job is being removed')
        await currentJob.remove();
    }
    clearInterval(upkeepInterval);
    await promisify(redisClient.del.bind(redisClient))(getProcessCleanupJobIdKey(process.env.PROCESS_ID));
    currentJob = null;
}

export async function cleanupProcess(processId: string) {
    const client = redisClient.duplicate();
    const spop: (s1: string) => Promise<string> = promisify(client.spop.bind(client));

    //Remove straggling connections from their associated keys
    let currentQueueId: number = Number.parseInt(await spop(getProcessQueuesKey(processId)));
    while (currentQueueId) {
        //Remove clients "connected" to the process from the complete set, and the connected client set
        const multiCommand = client
            .MULTI()
            .sdiffstore(
                getAlertClientSetKey(currentQueueId),
                getAlertClientSetKey(currentQueueId),
                getProcessConnectionIdsForQueueKey(currentQueueId, processId)
            )
            .sdiffstore(
                getAlertClientSetKey(currentQueueId),
                getAlertClientSetCompletedKey(currentQueueId),
                getProcessConnectionIdsForQueueKey(currentQueueId, processId)
            )
            .del(getProcessConnectionIdsForQueueKey(currentQueueId, processId));

        await promisify(multiCommand.exec.bind(multiCommand))();

        currentQueueId = Number.parseInt(await spop(getProcessQueuesKey(processId)));
    }
}
