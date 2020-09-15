import { ApiState } from "./common";
export declare enum QueueItemTypes {
    FOLLOWS_NOTIFICATION = 0,
    SUBSCRIBER_NOTIFICATION = 1,
    RAID_NOTIFICATION = 2,
    YOUTUBE_VIDEO = 3,
    BITS_NOTIFICATION = 4,
    DONATION_NOTIFICATION = 5
}
export declare type QueueItem = {
    id: number;
    type: QueueItemTypes;
    description: string;
    icon: string;
    estimatedDuration?: number;
};
export declare type AllQueueItemsResponse = {
    state: ApiState;
    items: QueueItem[];
};
export declare type AllQueueItemsRequest = {
    queueId: number;
};
export declare type Queue = {
    queueId: number;
    queueName: string;
};
export declare function isQueue(obj: any): obj is Queue;
export declare type GetAllQueuesResponse = {
    state: ApiState;
    queues: Queue[];
};
export declare function isGetAllQueuesResponse(obj: any): obj is GetAllQueuesResponse;
export declare function isAllQueueItemsRequest(obj: any): obj is AllQueueItemsRequest;
export declare type AddFollowQueueItemRequest = {
    queueId: number;
    followUser: string;
};
export declare function isAddFollowQueueItemRequest(obj: any): obj is AddFollowQueueItemRequest;
export declare type AddSubscriptionQueueItemRequest = {
    queueId: number;
    subscribingUser: string;
    streak: number;
    subscriberMessage?: string;
};
export declare function isAddSubscriptionQueueItemRequest(obj: any): obj is AddSubscriptionQueueItemRequest;
export declare type AddBitsQueueItemRequest = {
    queueId: number;
    user: string;
    amount: number;
    message?: string;
};
export declare function isAddBitsQueueItemRequest(obj: any): obj is AddBitsQueueItemRequest;
export declare type AddRaidQueueItemRequest = {
    queueId: number;
    raidUser: string;
    viewerAmount: number;
};
export declare function isAddRaidQueueItemRequest(obj: any): obj is AddRaidQueueItemRequest;
export declare type AddYoutubeQueueItemRequest = {
    queueId: number;
    sharingUser: string;
    videoIdOrUrl: string;
    durationS?: number;
    startTimeS?: number;
};
export declare function isAddYoutubeQueueItemRequest(obj: any): obj is AddYoutubeQueueItemRequest;
export declare type AddDonationQueueItemRequest = {
    queueId: number;
    anonymous: boolean;
    donatingUser: string;
    amountUSCent: number;
    message?: string;
};
export declare function isAddDonationQueueItemRequest(obj: any): obj is AddDonationQueueItemRequest;
