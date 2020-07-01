import {Application} from "express";
import {prisma} from "../../model/prisma";
import {
    API_PATH_GET_QUEUE_ITEMS_FULL_PATH,
    API_PATH_PREFIX,
    API_PATH_CURRENT_USER_PREFIX,
    isAllQueueItemsRequest,
    AllQueueItemsResponse,
    API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH,
    GenericResponse,
    API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH,
    isAddSubscriptionQueueItemRequest,
    API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH,
    isAddRaidQueueItemRequest,
    API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH,
    isAddYoutubeQueueItemRequest,
    API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH,
    isAddBitsQueueItemRequest,
    API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH, isAddDonationQueueItemRequest
} from "twitch_broadcasting_suite_shared/dist";
import {NeedsReAuthError, QueueNotFound} from "../errors/user_errors";
import {
    createBitsNotification, createDonationNotification,
    createFollowsNotification,
    createRaidNotification,
    createSubscriberNotification, createYoutubeVideoNotification,
    getAllQueueItemsForUser, queueBelongsToUser
} from "../logic/queue";
import {InvalidPayloadError} from "../errors/common";
import {isAddFollowQueueItemRequest} from "twitch_broadcasting_suite_shared/dist/types/api/queue";

function addUserRoutes(app: Application) {
    app.use(API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX, async function (req, res, next) {
        try {
            if (req.session.userId) {
                let user = await prisma.user.findOne({
                    where: {
                        id: req.session.userId
                    }
                });
                if (user) {
                    return next();
                }
            }
            throw new NeedsReAuthError();
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_GET_QUEUE_ITEMS_FULL_PATH, async function (req, res, next) {
        try {
            if (isAllQueueItemsRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                let items = await getAllQueueItemsForUser(req.session.userId, req.body.queueId);
                let response: AllQueueItemsResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    },
                    items
                };

                res.status(200);
                res.send(JSON.stringify(response));
                res.end();
            } else {
                throw new InvalidPayloadError('QueueItemsRequest', API_PATH_GET_QUEUE_ITEMS_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddFollowQueueItemRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createFollowsNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddFollowQueueItemRequest', API_PATH_ADD_TEST_FOLLOW_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddSubscriptionQueueItemRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createSubscriberNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddSubscriptionQueueItemRequest', API_PATH_ADD_TEST_SUBSCRIBE_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddRaidQueueItemRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createRaidNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddRaidQueueItemRequest', API_PATH_ADD_TEST_RAID_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddYoutubeQueueItemRequest(req.body)) {

                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createYoutubeVideoNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddYoutubeQueueItemRequest', API_PATH_ADD_TEST_YOUTUBE_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddBitsQueueItemRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createBitsNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddBitsQueueItemRequest', API_PATH_ADD_TEST_BITS_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });

    app.post(API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH, async function (req, res, next) {
        try {
            if (isAddDonationQueueItemRequest(req.body)) {
                if(!(await queueBelongsToUser(req.session.userId, req.body.queueId))){
                    throw new QueueNotFound();
                }

                await createDonationNotification(req.body);

                let resp: GenericResponse = {
                    state: {
                        needsReauth: false,
                        error: false
                    }
                };

                res.status(200);
                res.send(JSON.stringify(resp));
                res.end();
            } else {
                throw new InvalidPayloadError('AddDonationQueueItemRequest', API_PATH_ADD_TEST_DONATION_QUEUE_ITEM_FULL_PATH);
            }
        } catch (e) {
            next(e);
        }
    });
}

export {
    addUserRoutes
}