import {promisify} from 'util';
import {closeWebsocketServer} from './websocket-api/alerts';
import {prisma} from './model/prisma';
import redisClient, {pubSubRedisClient} from './model/redis';
import {httpsServer, server, webhookManager} from './index';
import {cleanupProcess, shutdownProcessUpkeep} from './process-management/logic';
import {shutdownQueueWorkers} from './process-management/workerQueue';

export async function shutdownGracefully() {
    let exitCode = 0;
    const closeServer = promisify(server.close.bind(server));

    console.log('Gracefully shutting down...');

    try {
        await closeWebsocketServer();
    } catch (e) {
        console.log('Error while shutting down websocket server');
        console.log(e);
        exitCode = 1;
    }

    if (httpsServer) {
        const closeHttpsServer = promisify(httpsServer.close.bind(httpsServer));

        try {
            await closeHttpsServer();
        } catch (e) {
            console.log('Error while shutting down https server');
            console.log(e);
            exitCode = 1;
        }
    }

    try {
        await closeServer();
    } catch (e) {
        console.log('Error while shutting down http server');
        console.log(e);
        exitCode = 1;
    }

    try {
        await webhookManager.destroy();
    } catch (e) {
        console.log('Error while destroying webhook manager');
        console.log(e);
        exitCode = 1;
    }

    try {
        await prisma.disconnect();
    } catch (e) {
        console.log('Error while shutting down database connection');
        console.log(e);
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
        console.log('Error while cleaning up process');
        console.log(e);
        exitCode = 1;
    }

    try {
        await shutdownQueueWorkers();
    } catch (e) {
        console.log('Error while shutting down queue workers');
        console.log(e);
        exitCode = 1;
    }

    redisClient.quit();
    pubSubRedisClient.quit();

    process.exit(exitCode);
}
