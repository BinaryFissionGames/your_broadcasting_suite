import {TokenInfo} from 'twitch-oauth-authorization-code-express';
import {User} from '@prisma/client';
import {prisma} from '../prisma';
import {validateToken} from '../../twitch-api/oauth';
import {logger} from '../../logging';

async function createOrGetUser(tokenInfo: TokenInfo): Promise<User> {
    const methodLogger = logger.child({file: __filename, method: 'createOrGetUser'});
    methodLogger.info(tokenInfo);
    const user = await prisma.user.findMany({
        where: {
            token: {
                oAuthToken: tokenInfo.access_token,
            },
        },
    });

    methodLogger.info(user);

    if (user.length >= 1) {
        methodLogger.info('User was found, returning user ' + user[0].twitchUserName);
        return user[0];
    }

    methodLogger.info('User not found, creating account.');
    //Request token from validation endpoint
    const validateInfo = await validateToken(tokenInfo.access_token);
    methodLogger.info('Validate info: ' + JSON.stringify(validateInfo));
    //TODO: Create webhooks subscriptions!!! This should be transactional!!! Usr should not be considered created until these are set up
    return await prisma.user.upsert({
        where: {
            twitchId: validateInfo.user_id,
        },
        create: {
            twitchUserName: validateInfo.login,
            twitchId: validateInfo.user_id,
            token: {
                create: {
                    oAuthToken: tokenInfo.access_token,
                    refreshToken: tokenInfo.refresh_token,
                    tokenExpiry: tokenInfo.expiry_date,
                    scopes: tokenInfo.scopes.join(' '),
                },
            },
        },
        update: {
            twitchUserName: validateInfo.login,
            token: {
                update: {
                    oAuthToken: tokenInfo.access_token,
                    refreshToken: tokenInfo.refresh_token,
                    tokenExpiry: tokenInfo.expiry_date,
                    scopes: tokenInfo.scopes.join(' '),
                },
            },
        },
    });
}

export {createOrGetUser};
