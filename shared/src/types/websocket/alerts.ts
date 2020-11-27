import {hasAndIsOfType} from "../helper";

export enum AlertType {
    TEXT_ALERT,
    IMAGE_ALERT,
    TEXT_AND_IMAGE_ALERT,
    VIDEO_ALERT
}

export type GenericAlert = {
    type: AlertType
}

export function isGenericAlert(obj: any): obj is GenericAlert {
    return typeof obj === 'object' &&
        hasAndIsOfType(obj, 'type', 'number');
}

export type TextAlert = {
    text: string
} & GenericAlert

export function isTextAlert(obj: any): obj is TextAlert {
    return isGenericAlert(obj) &&
        obj.type === AlertType.TEXT_ALERT &&
        hasAndIsOfType(obj, 'text', 'string');
}

export type ImageAlert = {
    imageUrl: string
} & GenericAlert

export function isImageAlert(obj: any): obj is ImageAlert {
    return isGenericAlert(obj) &&
        obj.type === AlertType.IMAGE_ALERT &&
        hasAndIsOfType(obj, 'imageUrl', 'string');
}

export type TextAndImageAlert = {
    text: string
    imageUrl: string
} & GenericAlert

export function isTextAndImageAlert(obj: any): obj is TextAndImageAlert {
    return isGenericAlert(obj) &&
        obj.type === AlertType.TEXT_AND_IMAGE_ALERT &&
        hasAndIsOfType(obj, 'imageUrl', 'string') &&
        hasAndIsOfType(obj, 'text', 'string');
}

export type VideoAlert = {
    embedUrl: string
    duration: number
} & GenericAlert

export function isVideoAlert(obj: any): obj is VideoAlert {
    return isGenericAlert(obj) &&
        obj.type === AlertType.VIDEO_ALERT &&
        hasAndIsOfType(obj, 'embedUrl', 'string') &&
        hasAndIsOfType(obj, 'duration', 'number');
}

/* Messages themselves: */

export enum AlertMessageType {
    DISPLAY_ALERT,
    RECONNECT,
    INFORM_ALERT_COMPLETE
}

export type GenericAlertMessage = {
    type: AlertMessageType
}

export function isGenericAlertMessage(obj: any): obj is GenericAlertMessage {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'type', 'number');
}

//Message that informs the client of an alert to display.
export type SendAlertMessage = {
    id: number,
    alert: GenericAlert
} & GenericAlertMessage

export function isSendAlertMessage(obj: any): obj is SendAlertMessage {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'type', 'number') &&
        obj.type === AlertMessageType.DISPLAY_ALERT &&
        hasAndIsOfType(obj, 'id', 'number') &&
        obj.alert && isGenericAlert(obj.alert);
}

//Message that informs the client that it will be disconnected, and to reconnect.
export type ReconnectMessage = {

} & GenericAlertMessage

export function isReconnectMessage(obj: any): obj is ReconnectMessage {
    return isGenericAlertMessage(obj);
}

//Message that informs the server that the alert is completed.
export type InformAlertCompleteMessage = {
    id: number
} & GenericAlertMessage

export function isInformAlertCompleteMessage(obj: any): obj is InformAlertCompleteMessage {
    return isGenericAlertMessage(obj) &&
        hasAndIsOfType(obj, 'id', 'number');
}