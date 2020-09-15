"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var helper_1 = require("../helper");
var QueueItemTypes;
(function (QueueItemTypes) {
    QueueItemTypes[QueueItemTypes["FOLLOWS_NOTIFICATION"] = 0] = "FOLLOWS_NOTIFICATION";
    QueueItemTypes[QueueItemTypes["SUBSCRIBER_NOTIFICATION"] = 1] = "SUBSCRIBER_NOTIFICATION";
    QueueItemTypes[QueueItemTypes["RAID_NOTIFICATION"] = 2] = "RAID_NOTIFICATION";
    QueueItemTypes[QueueItemTypes["YOUTUBE_VIDEO"] = 3] = "YOUTUBE_VIDEO";
    QueueItemTypes[QueueItemTypes["BITS_NOTIFICATION"] = 4] = "BITS_NOTIFICATION";
    QueueItemTypes[QueueItemTypes["DONATION_NOTIFICATION"] = 5] = "DONATION_NOTIFICATION";
})(QueueItemTypes = exports.QueueItemTypes || (exports.QueueItemTypes = {}));
function isQueue(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'queueName', 'string');
}
exports.isQueue = isQueue;
function isGetAllQueuesResponse(obj) {
    return obj && typeof obj === 'object' &&
        obj.state && common_1.isApiState(obj.state) &&
        obj.queues && Array.isArray(obj.queues) &&
        obj.queues.reduce(function (x, y) { return x && isQueue(y); }, true);
}
exports.isGetAllQueuesResponse = isGetAllQueuesResponse;
function isAllQueueItemsRequest(obj) {
    return obj && typeof obj === 'object' && helper_1.hasAndIsOfType(obj, 'queueId', 'number');
}
exports.isAllQueueItemsRequest = isAllQueueItemsRequest;
function isAddFollowQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'followUser', 'string');
}
exports.isAddFollowQueueItemRequest = isAddFollowQueueItemRequest;
function isAddSubscriptionQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'subscribingUser', 'string') &&
        helper_1.hasAndIsOfType(obj, 'streak', 'number') &&
        helper_1.mayHaveAndIsOfType(obj, 'subscriberMessage', 'string');
}
exports.isAddSubscriptionQueueItemRequest = isAddSubscriptionQueueItemRequest;
function isAddBitsQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'user', 'string') &&
        helper_1.hasAndIsOfType(obj, 'amount', 'number') &&
        helper_1.mayHaveAndIsOfType(obj, 'message', 'string');
}
exports.isAddBitsQueueItemRequest = isAddBitsQueueItemRequest;
function isAddRaidQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'raidUser', 'string') &&
        helper_1.hasAndIsOfType(obj, 'viewerAmount', 'number');
}
exports.isAddRaidQueueItemRequest = isAddRaidQueueItemRequest;
function isAddYoutubeQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'sharingUser', 'string') &&
        helper_1.hasAndIsOfType(obj, 'videoIdOrUrl', 'string') &&
        helper_1.mayHaveAndIsOfType(obj, 'durationS', 'number') &&
        helper_1.mayHaveAndIsOfType(obj, 'startTimeS', 'number');
}
exports.isAddYoutubeQueueItemRequest = isAddYoutubeQueueItemRequest;
function isAddDonationQueueItemRequest(obj) {
    return obj && typeof obj === 'object' &&
        helper_1.hasAndIsOfType(obj, 'queueId', 'number') &&
        helper_1.hasAndIsOfType(obj, 'anonymous', 'boolean') &&
        helper_1.hasAndIsOfType(obj, 'donatingUser', 'string') &&
        helper_1.hasAndIsOfType(obj, 'amountUSCent', 'number') &&
        helper_1.mayHaveAndIsOfType(obj, 'message', 'string');
}
exports.isAddDonationQueueItemRequest = isAddDonationQueueItemRequest;
