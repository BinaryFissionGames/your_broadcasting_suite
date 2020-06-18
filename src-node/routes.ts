import {Application} from "express";
import express = require("express");
import {prisma} from "./model/prisma";
import * as cors from 'cors'
import {LogoutResponse, VerifyLoggedInResponse} from "twitch_broadcasting_suite_shared/dist";

function setupRoutes(app: Application) {
    //Set up CORS
    app.use(cors({
        origin: process.env.CORS_ALLOW_ORIGINS.split(' '),
        credentials: true
    }));

    //Endpoint for ACME challenge
    app.use('/.well-known', express.static('www/.well-known', {
        index: false,
        dotfiles: "allow"
    }));

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

    app.use('/api/current_user', async function(req, res, next) {
        if (req.session.userId) {
            let user = await prisma.user.findOne({
                where: {
                    id: req.session.userId
                }
            });
            if(user){
                return next();
            }
        }
        return next(new Error('No authentication found! Relogin!'));
    });

    app.get('/api/current_user/queue/all', async function (req, res, next) {

    });
}

export {
    setupRoutes
}