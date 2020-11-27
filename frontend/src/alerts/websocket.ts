import {
    AlertMessageType,
    GenericAlert,
    InformAlertCompleteMessage,
    isImageAlert,
    isSendAlertMessage,
    isTextAlert,
    isTextAndImageAlert,
    isVideoAlert,
    WEBSOCKET_ALERTS_PATH,
    WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER,
    WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER,
    WEBSOCKET_PROTOCOL_ALERT,
} from 'twitch_broadcasting_suite_shared';
import {wait} from '../util/common';

const MAX_SAVED_ALERT_IDS = 10;
const seenAlertIds: number[] = [];
let websocket: WebSocket;

export function startupWebsocket() {
    const params = new URL(window.location.href);
    const queueId = params.searchParams.get(WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER);
    const code = params.searchParams.get(WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER);

    if (!queueId || !code) {
        console.error('Invalid URL!');
        return;
    }

    websocket = new WebSocket(getAlertsWebsocketUrl(queueId, code), WEBSOCKET_PROTOCOL_ALERT);

    websocket.addEventListener('message', websocketMessage);
    websocket.addEventListener('error', console.error);
    websocket.addEventListener('close', websocketClose);
}

function getAlertsWebsocketUrl(queueId: string, code: string): string {
    /*eslint-disable @typescript-eslint/ban-ts-comment*/
    // @ts-ignore define plugin will fill this in
    const url = new URL(WEBSOCKET_ALERTS_PATH, WEBSOCKET_SERVER);

    url.searchParams.set(WEBSOCKET_ALERTS_QUEUE_QUERY_PARAMETER, queueId);
    url.searchParams.set(WEBSOCKET_ALERTS_QUEUE_CODE_QUERY_PARAMETER, code);
    return url.href;
}

async function websocketMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);
    if (isSendAlertMessage(message)) {
        if (seenAlertIds.includes(message.id)) {
            console.debug(`Already seen message w/ id ${message.id}, ignoring...`);
            sendAlertDone(message.id);
            return;
        }

        if (seenAlertIds.length >= MAX_SAVED_ALERT_IDS) {
            seenAlertIds.shift();
        }

        seenAlertIds.push(message.id);

        await showAlert(message.alert);

        sendAlertDone(message.id);
    } else {
        console.error('Unknown message type, payload: ', event.data);
    }
}

function websocketClose(event: CloseEvent) {
    //Websocket closed; Let's attempt to re-open it immediately.
    console.log(event);
    setImmediate(startupWebsocket);
}

async function showAlert(alert: GenericAlert) {
    if (isTextAlert(alert)) {
        console.log('Text alert', alert);
    } else if (isTextAndImageAlert(alert)) {
        console.log('Text and image alert', alert);
    } else if (isImageAlert(alert)) {
        console.log('image alert', alert);
    } else if (isVideoAlert(alert)) {
        console.log('Video alert', alert);
    } else {
        console.error('Unknown alert type! payload: ', alert);
    }
    return wait(5000); // Wait 5 seconds; for testing purposes
}

function sendAlertDone(alertId: number) {
    const message: InformAlertCompleteMessage = {
        id: alertId,
        type: AlertMessageType.INFORM_ALERT_COMPLETE,
    };

    websocket.send(JSON.stringify(message));
}
