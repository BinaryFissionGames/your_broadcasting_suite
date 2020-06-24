import {Application} from "express";
import {prisma} from "../../model/prisma";
import {API_PATH_GET_QUEUE_ITEMS_FULL_PATH, API_PATH_PREFIX, API_PATH_CURRENT_USER_PREFIX} from "twitch_broadcasting_suite_shared/dist";
import {GenericError} from "../errors/common";
import {NeedsReAuthError} from "../errors/user_errors";

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

    });
}

export {
    addUserRoutes
}