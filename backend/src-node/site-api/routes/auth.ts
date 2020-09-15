import {Application} from 'express';
import {prisma} from '../../model/prisma';
import {
    LogoutResponse,
    VerifyLoggedInResponse,
    API_PATH_VERIFY_LOGGED_IN_FULL_PATH,
    API_PATH_LOG_OUT_FULL_PATH,
} from 'twitch_broadcasting_suite_shared/dist';
import {initUserIdempotent} from '../logic/user';

function addAuthRoutes(app: Application) {
    //Auth endpoints
    //Verifies if the caller is logged in or not
    //Possibly returns some user data (TBD)
    app.get(API_PATH_VERIFY_LOGGED_IN_FULL_PATH, async function (req, res, next) {
        try {
            let userLoggedIn = false;
            if (req.session.userId) {
                const user = await prisma.user.findOne({
                    where: {
                        id: req.session.userId,
                    },
                });

                if (user) {
                    userLoggedIn = true;
                    await initUserIdempotent(req.session.userId);
                }
            }

            const response: VerifyLoggedInResponse = {
                state: {
                    needsReauth: false,
                    error: false,
                },
                loggedIn: userLoggedIn,
            };

            res.send(response);
            res.end();
        } catch (e) {
            next(e);
        }
    });

    app.get(API_PATH_LOG_OUT_FULL_PATH, function (req, res, next) {
        try {
            req.session.destroy((e) => {
                if (e) {
                    next(e);
                }
                const response: LogoutResponse = {
                    state: {
                        needsReauth: false,
                        error: false,
                    },
                };
                res.send(response);
                res.end();
            });
        } catch (e) {
            next(e);
        }
    });
}

export {addAuthRoutes};
