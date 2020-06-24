import {Application} from "express";
import {prisma} from "../../model/prisma";
import {
    API_PATH_GET_QUEUE_ITEMS_FULL_PATH,
    API_PATH_PREFIX,
    API_PATH_CURRENT_USER_PREFIX,
    isAllQueueItemsRequest, AllQueueItemsResponse
} from "twitch_broadcasting_suite_shared/dist";
import {NeedsReAuthError} from "../errors/user_errors";
import {getAllQueueItemsForUser} from "../logic/queue";
import {InvalidPayloadError} from "../errors/common";

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
}

export {
    addUserRoutes
}