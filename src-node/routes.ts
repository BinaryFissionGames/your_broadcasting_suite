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

    app.get('/health', (req, res) => {
        res.status(200);
        res.send('OK');
        res.end();
    });

    addApiRoutes(app);
}

export {setupRoutes};
