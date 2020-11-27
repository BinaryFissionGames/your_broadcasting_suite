import * as oauth from 'twitch-oauth-authorization-code-express';
import {Token} from '@prisma/client';
import {parseScopesArray} from './model/util';
import got from 'got';
import {TokenInfo} from 'twitch-oauth-authorization-code-express';
import {prisma} from './model/prisma';

async function getOAuthToken(userId?: string): Promise<string> {
    if (userId) {
        const user = await prisma.user.findOne({
            where: {twitchId: userId},
            include: {
                token: {
                    select: {
                        oAuthToken: true,
                    },
                },
            },
        });
        return user.token.oAuthToken;
    } else {
        const token = await prisma.token.findOne({where: {ownerId: null}, select: {oAuthToken: true}});
        if (token) {
            return token.oAuthToken;
        }

        return (await requestAppToken([])).oAuthToken;
    }
}

async function refreshToken(oAuthToken: string): Promise<string> {
    const token = await prisma.token.findOne({where: {oAuthToken: oAuthToken}});
    if (token) {
        const scopes = parseScopesArray(token.scopes);
        if (!token.ownerId) {
            await prisma.token.delete({
                where: {
                    id: token.id,
                },
            });
            return (await requestAppToken(scopes)).oAuthToken;
        } else {
            const info = await oauth.refreshToken(
                token.refreshToken,
                process.env.TWITCH_CLIENT_ID,
                process.env.TWITCH_CLIENT_SECRET,
                scopes
            );

            await prisma.token.update({
                where: {
                    id: token.id,
                },
                data: {
                    oAuthToken: info.access_token,
                    refreshToken: info.refresh_token,
                    tokenExpiry: info.expiry_date,
                    scopes: info.scopes.join(' '),
                },
            });
            return info.access_token;
        }
    } else {
        throw new Error(`Token ${oAuthToken} does not exist in DB.`);
    }
}

async function requestAppToken(scopes: string[]): Promise<Token> {
    const reqUrl = new URL('https://id.twitch.tv/oauth2/token');
    reqUrl.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID);
    reqUrl.searchParams.set('client_secret', process.env.TWITCH_CLIENT_SECRET);
    reqUrl.searchParams.set('grant_type', 'client_credentials');
    if (scopes && scopes.length >= 1) {
        reqUrl.searchParams.set('scope', scopes.join(' '));
    }

    const response = await got.post(reqUrl.href);

    if (Math.floor(response.statusCode / 100) !== 2) {
        throw new Error('Bad status code when retrieving app access token!');
    }

    const token_info: TokenInfo = JSON.parse(response.body);

    return await prisma.token.create({
        data: {
            oAuthToken: token_info.access_token,
            tokenExpiry: token_info.expiry_date,
            scopes: token_info.scopes.join(' '),
        },
    });
}

export {getOAuthToken, refreshToken};
