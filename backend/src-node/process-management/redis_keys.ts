export function getProcessCleanupJobIdKey(processId: string): string {
    return `process-cleanup-job:${processId}`;
}
