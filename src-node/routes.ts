import {Application} from 'express';
import express = require('express');
import {addApiRoutes} from './site-api/routes';

function setupRoutes(app: Application) {
    //Endpoint for ACME challenge
    app.use(
        '/.well-known',
        express.static('www/.well-known', {
            index: false,
            dotfiles: 'allow',
        })
    );

    addApiRoutes(app);
}

export {setupRoutes};
