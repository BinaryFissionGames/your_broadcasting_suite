
export let alertQueueSubKeyRegex = /alert-client-sub:(\d+)/
export function getAlertQueueSubKey(queueId: number): string {
    return `alert-client-sub:${queueId.toFixed(0)}`;
}

export function getAlertClientSetCompletedKey(queueId: number): string{
    return `alert-clients-done:${queueId.toFixed(0)}`;
}

export function getCurrentAlertIdKey(queueId: number): string{
    return `current-queue-alert:${queueId.toFixed(0)}`;
}

//TODO: For each node/process, keep a list of queue IDs that are in use, so we can remove them in a performant manner in case of restart
export function getAlertClientSetKey(queueId: number): string{
    return `alert-clients:${queueId.toFixed(0)}`;
}

export function getAlertClientSetValue(node: number, process: number, queueId: number, connectionId: string): string {
    return `${node.toFixed(0)}:${process.toFixed(0)}:${queueId.toFixed(0)}:${connectionId}`;
}