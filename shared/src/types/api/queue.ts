import {ApiState, isApiState} from "./common";
import {hasAndIsOfType, mayHaveAndIsOfType} from "../helper";

export enum QueueItemTypes {
    FOLLOWS_NOTIFICATION,
    SUBSCRIBER_NOTIFICATION,
    RAID_NOTIFICATION,
    YOUTUBE_VIDEO,
    BITS_NOTIFICATION,
    DONATION_NOTIFICATION
}

export type QueueItem = {
    id: number,
    type: QueueItemTypes,
    description: string,
    icon: string,
    estimatedDuration?: number
}

export type AllQueueItemsResponse = {
    state: ApiState,
    items: QueueItem[]
}

export type AllQueueItemsRequest = {
    queueId: number
}

export type Queue = {
    queueId: number
    queueName: string
}

export function isQueue(obj: any): obj is Queue {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'queueName', 'string');
}

export type GetAllQueuesResponse = {
    state: ApiState,
    queues: Queue[]
}

export function isGetAllQueuesResponse(obj: any): obj is GetAllQueuesResponse {
    return obj && typeof obj === 'object' &&
        obj.state && isApiState(obj.state) &&
        obj.queues && Array.isArray(obj.queues) &&
        obj.queues.reduce((x: boolean, y: any) => x && isQueue(y), true);
}

export function isAllQueueItemsRequest(obj: any): obj is AllQueueItemsRequest {
    return obj && typeof obj === 'object' && hasAndIsOfType(obj, 'queueId', 'number');
}

export type AddFollowQueueItemRequest = {
    queueId: number,
    followUser: string
}

export function isAddFollowQueueItemRequest(obj: any): obj is AddFollowQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'followUser', 'string');
}

export type AddSubscriptionQueueItemRequest = {
    queueId: number,
    subscribingUser: string,
    streak: number,
    subscriberMessage?: string
}

export function isAddSubscriptionQueueItemRequest(obj: any): obj is AddSubscriptionQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'subscribingUser', 'string') &&
        hasAndIsOfType(obj, 'streak', 'number') &&
        mayHaveAndIsOfType(obj, 'subscriberMessage', 'string');
}

export type AddBitsQueueItemRequest = {
    queueId: number,
    user: string,
    amount: number,
    message?: string
}

export function isAddBitsQueueItemRequest(obj: any): obj is AddBitsQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'user', 'string') &&
        hasAndIsOfType(obj, 'amount', 'number') &&
        mayHaveAndIsOfType(obj, 'message', 'string');
}

export type AddRaidQueueItemRequest = {
    queueId: number,
    raidUser: string,
    viewerAmount: number
}

export function isAddRaidQueueItemRequest(obj: any): obj is AddRaidQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'raidUser', 'string') &&
        hasAndIsOfType(obj, 'viewerAmount', 'number');
}

export type AddYoutubeQueueItemRequest = {
    queueId: number,
    sharingUser: string,
    videoIdOrUrl: string,
    durationS?: number,
    startTimeS?: number
}

export function isAddYoutubeQueueItemRequest(obj: any): obj is AddYoutubeQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'sharingUser', 'string') &&
        hasAndIsOfType(obj, 'videoIdOrUrl', 'string') &&
        mayHaveAndIsOfType(obj, 'durationS', 'number') &&
        mayHaveAndIsOfType(obj, 'startTimeS', 'number');
}

export type AddDonationQueueItemRequest = {
    queueId: number,
    anonymous: boolean,
    donatingUser: string,
    amountUSCent: number,
    message?: string
}

export function isAddDonationQueueItemRequest(obj: any): obj is AddDonationQueueItemRequest {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'queueId', 'number') &&
        hasAndIsOfType(obj, 'anonymous', 'boolean') &&
        hasAndIsOfType(obj, 'donatingUser', 'string') &&
        hasAndIsOfType(obj, 'amountUSCent', 'number') &&
        mayHaveAndIsOfType(obj, 'message', 'string');
}
