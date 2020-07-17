export const PROCESS_CLEANUP_QUEUE_NAME = 'process cleanup';
export const WEBSOCKET_CONNECTION_CLEANUP_QUEUE_NAME = 'websocket connection cleanup';

export const PROCESS_STALLED_TIME_S = 30; // After this amount of seconds of not responding, the process is considered stalled.
export const PROCESS_STALL_TIMER_UPKEEP_TIME_S = PROCESS_STALLED_TIME_S / 2; // After this amound of seconds, the process will do it's action to keep it from being marked as stalled.

export const WEBSOCKET_GRACEFUL_CLOSE_REMOVAL_TIME_S = 5;

export const WEBSOCK_KEEP_ALIVE_INTERVAL = 5000;
export const WEBSOCK_KEEP_ALIVE_GRACE_PERIOD = 5000;

export const EXPRESS_SESSION_COOKIE_NAME = 'session_id';
