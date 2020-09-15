import {TokenInfo} from 'twitch-oauth-authorization-code-express';
import {User} from '@prisma/client';
import {prisma} from '../prisma';
import {validateToken} from '../../twitch-api/oauth';

async function createOrGetUser(tokenInfo: TokenInfo): Promise<User> {
    console.log(tokenInfo);
    const user = await prisma.user.findMany({
        where: {
            token: {
                oAuthToken: tokenInfo.access_token,
            },
        },
    });

    console.log(user);

    if (user.length >= 1) {
        return user[0];
    }

    //Request token from validation endpoint
    const validateInfo = await validateToken(tokenInfo.access_token);
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
