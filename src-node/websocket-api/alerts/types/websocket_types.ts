import * as net from 'net';

export type AlertSocket = {
    queueId?: number;
    connectionId?: string;
} & net.Socket;
