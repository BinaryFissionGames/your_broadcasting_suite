import {Application} from "express";
import {prisma} from "../../model/prisma";
import {API_PATH_GET_QUEUE_ITEMS_FULL_PATH, API_PATH_PREFIX, API_PATH_CURRENT_USER_PREFIX} from "twitch_broadcasting_suite_shared/dist";

function addUserRoutes(app: Application) {
    app.use(API_PATH_PREFIX + API_PATH_CURRENT_USER_PREFIX, async function (req, res, next) {
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
        return next(new Error('No authentication found! Relogin!'));
    });

    app.get(API_PATH_GET_QUEUE_ITEMS_FULL_PATH, async function (req, res, next) {

    });
}

export {
    addUserRoutes
}