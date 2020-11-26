import {Application} from 'express';
import {addApiRoutes} from './site-api/routes';

function setupRoutes(app: Application) {
    app.get('/health', (req, res) => {
        res.status(200);
        res.send('OK');
        res.end();
    });

    addApiRoutes(app);
}

export {setupRoutes};
