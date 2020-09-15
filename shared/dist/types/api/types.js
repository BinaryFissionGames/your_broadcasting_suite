"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isApiState(obj) {
    return typeof obj === 'object' && obj.needsReauth && typeof obj.needsReauth === 'boolean' && obj.error && typeof obj.error === 'boolean';
}
exports.isApiState = isApiState;
function isGenericResponse(obj) {
    return typeof obj === 'object' && obj.state && isApiState(obj.state);
}
exports.isGenericResponse = isGenericResponse;
function isAllQueueItemsRequest(obj) {
    return typeof obj === 'object' && obj.queueId && typeof obj.queueId === 'number';
}
exports.isAllQueueItemsRequest = isAllQueueItemsRequest;
