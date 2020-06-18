import {Application} from "express";
import {prisma} from "../../model/prisma";
import {LogoutResponse, VerifyLoggedInResponse} from "twitch_broadcasting_suite_shared/dist";

function addAuthRoutes(app: Application) {
    //Auth endpoints
    //Verifies if the caller is logged in or not
    //Possibly returns some user data (TBD)
    //TODO Seperate into logic + route
    app.get('/api/auth/verifyLoggedIn', async function (req, res, next) {
        let userLoggedIn = false;
        //TODO: Assert that token exists attached to user; If not, send that the user needs to re-auth
        if (req.session.userId) {
            let user = await prisma.user.findOne({
                where: {
                    id: req.session.userId
                }
            });

            if (user) {
                userLoggedIn = true;
            }
        }

        let response: VerifyLoggedInResponse = {
            state: {
                needsReauth: false,
                error: false,
            },
            loggedIn: userLoggedIn
        };

        res.send(response);
        res.end();
    });

    app.get('/api/auth/logout', function (req, res, next) {
        req.session.destroy((e) => {
            if(e){
                //TODO: Set up error handling
                next(e);
            }
            let response: LogoutResponse = {
                state: {
                    needsReauth: false,
                    error: false
                }
            };
            res.send(response);
            res.end();
        });
    });
}

export {
    addAuthRoutes
}