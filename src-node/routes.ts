import {Application} from "express";
import express = require("express");
import {prisma} from "./model/prisma";
import * as cors from 'cors'

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
    app.get('/auth/verifyLoggedIn', function (req, res) {
        let userLoggedIn = false;
        //TODO: Assert that token exists attached to user; If not, send that the user needs to re-auth
        if (req.session.userId) {
            let user = prisma.user.findOne({
                where: {
                    id: req.session.userId
                }
            });

            if (user) {
                userLoggedIn = true;
            }
        }

        res.send({
            loggedIn: userLoggedIn
        });

        res.end();
    });
}

export {
    setupRoutes
}