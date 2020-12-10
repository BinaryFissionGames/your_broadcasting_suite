import {promisify} from 'util';
import {closeWebsocketServer} from './websocket-api/alerts';
import {prisma} from './model/prisma';
import redisClient, {pubSubRedisClient} from './model/redis';
import {httpsServer, server, webhookManager} from './index';
import {cleanupProcess, shutdownProcessUpkeep} from './process-management/logic';
import {shutdownQueueWorkers} from './process-management/workerQueue';
import {logger} from './logging';

export async function shutdownGracefully() {
    let exitCode = 0;
    const closeServer = promisify(server.close.bind(server));
    const methodLogger = logger.child({file: __filename, method: 'shutdownGracefully'});
    methodLogger.info('Gracefully shutting down...');

    try {
        await closeWebsocketServer();
    } catch (e) {
        methodLogger.error('Error while shutting down websocket server');
        methodLogger.error(e);
        exitCode = 1;
    }

    if (httpsServer) {
        const closeHttpsServer = promisify(httpsServer.close.bind(httpsServer));

        try {
            await closeHttpsServer();
        } catch (e) {
            methodLogger.error('Error while shutting down https server');
            methodLogger.error(e);
            exitCode = 1;
        }
    }

    try {
        await closeServer();
    } catch (e) {
        methodLogger.error('Error while shutting down http server');
        methodLogger.error(e);
        exitCode = 1;
    }

    try {
        await webhookManager.destroy();
    } catch (e) {
        methodLogger.error('Error while destroying webhook manager');
        methodLogger.error(e);
        exitCode = 1;
    }

    try {
        await prisma.disconnect();
    } catch (e) {
        methodLogger.error('Error while shutting down database connection');
        methodLogger.error(e);
        exitCode = 1;
    }

    if (process.env.NODE_ENV === 'development') {
        const mockAuthServer = await import('twitch-mock-oauth-server/dist/programmatic_api');
        const mockWebhookHub = await import('twitch-mock-webhook-hub/dist/programmatic_api');

        await mockAuthServer.closeMockServer(true);
        await mockWebhookHub.closeMockServer(true);
    }

    try {
        await cleanupProcess(process.env.PROCESS_ID);
        await shutdownProcessUpkeep();
    } catch (e) {
        methodLogger.error('Error while cleaning up process');
        methodLogger.error(e);
        exitCode = 1;
    }

    try {
        await shutdownQueueWorkers();
    } catch (e) {
        methodLogger.error('Error while shutting down queue workers');
        methodLogger.error(e);
        exitCode = 1;
    }

    redisClient.quit();
    pubSubRedisClient.quit();

    process.exit(exitCode);
}
