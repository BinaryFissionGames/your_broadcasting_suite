import {connection, IMessage, request, server as WebsocketServer} from 'websocket';
import * as http from 'http';
import * as https from 'https';
import {WEBSOCK_KEEP_ALIVE_GRACE_PERIOD, WEBSOCK_KEEP_ALIVE_INTERVAL} from '../../constants';
import {
    AlertMessageType, isInformAlertCompleteMessage,
    SendAlertMessage,
    WEBSOCKET_ALERTS_PATH,
    WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER,
    WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER,
    WEBSOCKET_PROTOCOL_ALERT,
    WEBSOCKET_PROTOCOLS
} from 'twitch_broadcasting_suite_shared/dist';
import {AlertSocket} from './types/websocket_types';
import {
    emitToAllForQueue,
    getCurrentQueueItem,
    isCodeValidForQueue,
    sendAlertToClient
} from './logic/logic';
import {
    addAlertConnection,
    checkAndPublishNextAlert,
    markAlertDoneForConnection,
    removeAlertConnection
} from './logic/redis_logic';
import {isEmitNextAlertMessage} from '../../model/messages/types';
import {v4 as uuidv4} from 'uuid';
import {alertQueueSubKeyRegex} from './logic/redis_keys';
import {pubSubRedisClient} from '../../model/redis';

let websockServerHttp: WebsocketServer | undefined;
let websockServerHttps: WebsocketServer | undefined;
let shuttingDownServer = false;

//Todo: Startup handler
export async function initWebsocketServer(httpServer: http.Server, httpsServer?: https.Server): Promise<void> {
    shuttingDownServer = false;

    websockServerHttp = new WebsocketServer({
        httpServer,
        keepaliveInterval: WEBSOCK_KEEP_ALIVE_INTERVAL,
        keepaliveGracePeriod: WEBSOCK_KEEP_ALIVE_GRACE_PERIOD
    });
    websockServerHttp.on('request', requestHandler);
    websockServerHttp.on('connect', connectionHandler);
    websockServerHttp.on('close', connectionCloseHandler);

    if (httpsServer) {
        websockServerHttps = new WebsocketServer({
            httpServer: httpsServer,
            keepaliveInterval: WEBSOCK_KEEP_ALIVE_INTERVAL,
            keepaliveGracePeriod: WEBSOCK_KEEP_ALIVE_GRACE_PERIOD
        });
        websockServerHttps.on('request', requestHandler);
        websockServerHttps.on('connect', connectionHandler);
        websockServerHttps.on('close', connectionCloseHandler);
    }

    pubSubRedisClient.on("message", alertMessageQueueHandler);

}

export async function closeWebsocketServer() {
    shuttingDownServer = true;
    if (websockServerHttp) {
        websockServerHttp.closeAllConnections();
        websockServerHttp.shutDown();
    }

    if (websockServerHttps) {
        websockServerHttps.closeAllConnections();
        websockServerHttps.shutDown();
    }
}

async function requestHandler(webSocketRequest: request) {
    try {
        let validProtocol: string | undefined;
        for (let protocol of webSocketRequest.requestedProtocols) {
            if (WEBSOCKET_PROTOCOLS.includes(protocol)) {
                validProtocol = protocol;
                break;
            }
        }

        if (validProtocol) {
            if (validProtocol === WEBSOCKET_PROTOCOL_ALERT) {
                //Alert has some extra constraints & setup:

                let url = new URL(webSocketRequest.resourceURL.href, 'http://localhost');
                if (url.pathname !== WEBSOCKET_ALERTS_PATH) {
                    console.error('Resource URL path = ' + webSocketRequest.resourceURL.path);
                    return webSocketRequest.reject(400, `Path must be ${WEBSOCKET_ALERTS_PATH} from protocol ${WEBSOCKET_PROTOCOL_ALERT}`);
                }

                let qParams = url.searchParams;
                let queueParam = qParams.get(WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER);
                let codeParam = qParams.get(WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER);

                if (!queueParam || !codeParam) {
                    console.log('Missing queue param or code param');
                    return webSocketRequest.reject(400, `Path must contain ${WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER} and ${WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER} query parameters`);
                }

                if (!(await isCodeValidForQueue(codeParam, Number.parseInt(queueParam)))) {
                    console.log(`Code is not correct for queue, code: ${codeParam}, queue: ${queueParam}`);
                    return webSocketRequest.reject(403, 'Secret is invalid.');
                }

                let socket = <AlertSocket>webSocketRequest.socket;
                socket.queueId = Number.parseInt(queueParam);
                socket.connectionId = uuidv4();
            }

            return webSocketRequest.accept(validProtocol);
        } else {
            console.error('Protocol does not match any known protocols');
            return webSocketRequest.reject(400, 'No matching protocol');
        }
    } catch (e) {
        console.error(e);
        return webSocketRequest.reject(500, 'Internal server error');
    }

}

//TODO Add a timer/timeout - maybe depending on quorum or something (e.g. if 50% or more have finished, leave a few seconds for stuff), we need to cull the connection,
// since it is not reliable.
async function connectionHandler(webSocketConnection: connection) {
    if (webSocketConnection.protocol === WEBSOCKET_PROTOCOL_ALERT) {
        let socket = <AlertSocket>webSocketConnection.socket;
        webSocketConnection.on('message', getAlertProtocolHandler(webSocketConnection));
        //Add connection to set, subscribe to messages
        await addAlertConnection(socket.queueId, webSocketConnection);
        //Get/send current alert to receiver
        let currentAlert = await getCurrentQueueItem(socket.queueId);
        if (currentAlert) {
            await sendAlertToClient(currentAlert, webSocketConnection);
        }
    }
}

async function connectionCloseHandler(connection: connection, _reason: number, _desc: string) {
    //TODO: Think on how to fix this potentially completing an alert if the server gracefully shuts down - clients
    // connected to this node may miss an alert.
    // Potential solution - create some timer that after X(5-ish) seconds, will remove the connection (try rsmq worker queue, message w/ visibility timer). This will give the client X
    // seconds to reconnect, after which it will be removed. If it's reconnected, it will be in the set w/ a new ID, and removal won't affect anything.
    // If it doesn't reconnect, it will just be removed.
    if (connection.protocol === WEBSOCKET_PROTOCOL_ALERT) {
        let socket = <AlertSocket>connection.socket;
        await removeAlertConnection(socket.queueId, connection);
        await checkAndPublishNextAlert(socket.queueId);
    }
}

export async function alertMessageQueueHandler(channel: string, message: string) {

    let match = channel.match(alertQueueSubKeyRegex);
    if(!match){
        return;
    }

    let queueId = Number.parseInt(match[1]);

    if (!message) {
        console.error('Alert message queue handler was called, but no message was found in the queue!');
        return;
    }

    console.log(message);
    let parsedMsg = JSON.parse(message);
    if (isEmitNextAlertMessage(parsedMsg)) {
        let websockMessage: SendAlertMessage = {
            id: parsedMsg.queueItemId,
            type: AlertMessageType.DISPLAY_ALERT,
            alert: parsedMsg.queueItemAlert
        };

        await emitToAllForQueue(queueId, websockMessage);
    } else {
        console.error('Alert message queue handler was called, but the message was invalid! Message: ' + message);
    }
}

function getAlertProtocolHandler(connection: connection) {
    return async function(message: IMessage) {
        console.log(message.utf8Data);
        let messageObj = JSON.parse(message.utf8Data);
        if (isInformAlertCompleteMessage(messageObj)) {
            let socket = <AlertSocket>connection.socket;
            await markAlertDoneForConnection(socket.queueId, socket.connectionId);
            await checkAndPublishNextAlert(socket.queueId);
        }
    };
}