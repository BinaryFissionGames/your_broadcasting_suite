import {Application} from "express";
import {prisma} from "../../model/prisma";

function addUserRoutes(app: Application) {
    app.use('/api/current_user', async function (req, res, next) {
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

    app.get('/api/current_user/queue/all', async function (req, res, next) {

    });
}

export {
    addUserRoutes
}