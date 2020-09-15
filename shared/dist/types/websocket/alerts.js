"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("../helper");
var AlertType;
(function (AlertType) {
    AlertType[AlertType["TEXT_ALERT"] = 0] = "TEXT_ALERT";
    AlertType[AlertType["IMAGE_ALERT"] = 1] = "IMAGE_ALERT";
    AlertType[AlertType["TEXT_AND_IMAGE_ALERT"] = 2] = "TEXT_AND_IMAGE_ALERT";
    AlertType[AlertType["VIDEO_ALERT"] = 3] = "VIDEO_ALERT";
})(AlertType = exports.AlertType || (exports.AlertType = {}));
function isGenericAlert(obj) {
    return typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'type', 'number');
}
exports.isGenericAlert = isGenericAlert;
function isTextAlert(obj) {
    return isGenericAlert(obj) &&
        obj.type === AlertType.TEXT_ALERT &&
        helper_1.hasAndIsOfType(obj, 'text', 'string');
}
exports.isTextAlert = isTextAlert;
function isImageAlert(obj) {
    return isGenericAlert(obj) &&
        obj.type === AlertType.IMAGE_ALERT &&
        helper_1.hasAndIsOfType(obj, 'imageUrl', 'string');
}
exports.isImageAlert = isImageAlert;
function isTextAndImageAlert(obj) {
    return isGenericAlert(obj) &&
        obj.type === AlertType.TEXT_AND_IMAGE_ALERT &&
        helper_1.hasAndIsOfType(obj, 'imageUrl', 'string') &&
        helper_1.hasAndIsOfType(obj, 'text', 'string');
}
exports.isTextAndImageAlert = isTextAndImageAlert;
function isVideoAlert(obj) {
    return isGenericAlert(obj) &&
        obj.type === AlertType.VIDEO_ALERT &&
        helper_1.hasAndIsOfType(obj, 'embedUrl', 'string') &&
        helper_1.hasAndIsOfType(obj, 'duration', 'number');
}
exports.isVideoAlert = isVideoAlert;
/* Messages themselves: */
var AlertMessageType;
(function (AlertMessageType) {
    AlertMessageType[AlertMessageType["DISPLAY_ALERT"] = 0] = "DISPLAY_ALERT";
    AlertMessageType[AlertMessageType["RECONNECT"] = 1] = "RECONNECT";
    AlertMessageType[AlertMessageType["INFORM_ALERT_COMPLETE"] = 2] = "INFORM_ALERT_COMPLETE";
})(AlertMessageType = exports.AlertMessageType || (exports.AlertMessageType = {}));
function isGenericAlertMessage(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'type', 'number');
}
exports.isGenericAlertMessage = isGenericAlertMessage;
function isSendAlertMessage(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'type', 'number') &&
        obj.type === AlertMessageType.DISPLAY_ALERT &&
        helper_1.hasAndIsOfType(obj, 'id', 'number') &&
        obj.alert && isGenericAlert(obj.alert);
}
exports.isSendAlertMessage = isSendAlertMessage;
function isReconnectMessage(obj) {
    return isGenericAlertMessage(obj);
}
exports.isReconnectMessage = isReconnectMessage;
function isInformAlertCompleteMessage(obj) {
    return isGenericAlertMessage(obj) &&
        helper_1.hasAndIsOfType(obj, 'id', 'number');
}
exports.isInformAlertCompleteMessage = isInformAlertCompleteMessage;
