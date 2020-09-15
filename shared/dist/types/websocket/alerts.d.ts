export declare enum AlertType {
    TEXT_ALERT = 0,
    IMAGE_ALERT = 1,
    TEXT_AND_IMAGE_ALERT = 2,
    VIDEO_ALERT = 3
}
export declare type GenericAlert = {
    type: AlertType;
};
export declare function isGenericAlert(obj: any): obj is GenericAlert;
export declare type TextAlert = {
    text: string;
} & GenericAlert;
export declare function isTextAlert(obj: any): obj is TextAlert;
export declare type ImageAlert = {
    imageUrl: string;
} & GenericAlert;
export declare function isImageAlert(obj: any): obj is ImageAlert;
export declare type TextAndImageAlert = {
    text: string;
    imageUrl: string;
} & GenericAlert;
export declare function isTextAndImageAlert(obj: any): obj is TextAndImageAlert;
export declare type VideoAlert = {
    embedUrl: string;
    duration: number;
} & GenericAlert;
export declare function isVideoAlert(obj: any): obj is VideoAlert;
export declare enum AlertMessageType {
    DISPLAY_ALERT = 0,
    RECONNECT = 1,
    INFORM_ALERT_COMPLETE = 2
}
export declare type GenericAlertMessage = {
    type: AlertMessageType;
};
export declare function isGenericAlertMessage(obj: any): obj is GenericAlertMessage;
export declare type SendAlertMessage = {
    id: number;
    alert: GenericAlert;
} & GenericAlertMessage;
export declare function isSendAlertMessage(obj: any): obj is SendAlertMessage;
export declare type ReconnectMessage = {} & GenericAlertMessage;
export declare function isReconnectMessage(obj: any): obj is ReconnectMessage;
export declare type InformAlertCompleteMessage = {
    id: number;
} & GenericAlertMessage;
export declare function isInformAlertCompleteMessage(obj: any): obj is InformAlertCompleteMessage;
