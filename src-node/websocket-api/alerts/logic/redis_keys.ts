export const alertQueueSubKeyRegex = /alert-client-sub:(\d+)/;
//Key that will be published to when a new alert should be sent to connections listening for the given queue id
export function getAlertQueueSubKey(queueId: number): string {
    return `alert-client-sub:${queueId.toFixed(0)}`;
}

//Key for the set that contains the ID's of connections that have completed the current alert for the given queue.
export function getAlertClientSetCompletedKey(queueId: number): string {
    return `alert-clients-done:${queueId.toFixed(0)}`;
}

//Key where the current alert's ID is stored.
export function getCurrentAlertIdKey(queueId: number): string {
    return `current-queue-alert:${queueId.toFixed(0)}`;
}

//Key for the set of current queue ids that have connections for this process is stored.
export function getProcessQueuesKey(processId: string): string {
    return `process-connected-queues:${processId}`;
}

//Key for the set containing all connection ids on the given queue for the given process
export function getProcessConnectionIdsForQueueKey(queueId: number, processId: string): string {
    return `process-connection-ids-for-queue:${queueId.toFixed(0)}:${processId}`;
}

//Key for the set that contains all the clients listening for a specific queue over all processes.
export function getAlertClientSetKey(queueId: number): string {
    return `alert-clients:${queueId.toFixed(0)}`;
}
