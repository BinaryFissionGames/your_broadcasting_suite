import {hasAndIsOfType} from 'twitch_broadcasting_suite_shared/dist/types/helper';
import {GenericAlert, isGenericAlert} from 'twitch_broadcasting_suite_shared/dist';

export enum AlertMessageType {
    EMIT_NEXT_ALERT,
}

export type GenericAlertMessage = {
    type: AlertMessageType
}

export function isGenericAlertMessage(obj: any): obj is GenericAlertMessage {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'type', 'number');
}

export type EmitNextAlertMessage = {
    queueItemId: number
    queueItemAlert: GenericAlert
} & GenericAlertMessage;

export function isEmitNextAlertMessage(obj: any): obj is EmitNextAlertMessage {
    return isGenericAlertMessage(obj) &&
        obj.type === AlertMessageType.EMIT_NEXT_ALERT &&
        hasAndIsOfType(obj, 'queueItemId', 'number')
        && isGenericAlert(obj);
}