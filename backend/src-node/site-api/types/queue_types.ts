import {
    AddBitsQueueItemRequest,
    AddDonationQueueItemRequest,
    AddFollowQueueItemRequest,
    AddRaidQueueItemRequest,
    AddSubscriptionQueueItemRequest,
    AddYoutubeQueueItemRequest,
    QueueItemTypes,
} from 'twitch_broadcasting_suite_shared';

export type CreateQueueItemData = {
    queueId: number;
    type: QueueItemTypes;
    extraData:
        | AddFollowQueueItemRequest
        | AddSubscriptionQueueItemRequest
        | AddBitsQueueItemRequest
        | AddRaidQueueItemRequest
        | AddYoutubeQueueItemRequest
        | AddDonationQueueItemRequest;
};
