import * as https from "https";
import * as oauth from "twitch-oauth-authorization-code-express"
import {PrismaClient, Token} from '@prisma/client'
import {parseScopesArray} from "./model/util";

async function sendGetTwitchRequest(url: string, token: string, refreshToken: () => Promise<string>): Promise<string> {
    let runRequest = function (resolve, reject, token: string, tryAgain: boolean) {
        let httpsReq = https.request(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Client-ID": process.env.CLIENT_ID,
            },
            method: "GET"
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        });

        httpsReq.on('error', () => {
            console.error("Failed to call validate endpoint.");
            if (tryAgain) {
                refreshToken().then((token) => {
                    runRequest(resolve, reject, token, false);
                });
            } else {
                reject(new Error("Http request failed."));
            }
        });

        httpsReq.end();
    };

    return new Promise((resolve, reject) => {
        runRequest(resolve, reject, token, true);
    });
}

async function sendPostTwitchRequest(url: string, token: string, refreshToken: () => Promise<string>, body?: object): Promise<string> {
    let runRequest = function (resolve: { (value?: string | PromiseLike<string>): void; (arg0: string): void; }, reject: { (reason?: any): void; (arg0: Error): void; }, token: string, tryAgain: boolean) {
        let httpsReq = https.request(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Client-ID": process.env.CLIENT_ID,
            },
            method: "POST"
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        });

        httpsReq.on('error', () => {
            console.error("Failed to call validate endpoint.");
            if (tryAgain) {
                refreshToken().then((token) => {
                    runRequest(resolve, reject, token, false);
                });
            } else {
                reject(new Error("Http request failed."));
            }
        });
        if (body) {
            httpsReq.write(JSON.stringify(body));
        }
        httpsReq.end();
    };

    return new Promise((resolve, reject) => {
        runRequest(resolve, reject, token, true);
    });
}

async function getOAuthToken(prisma: PrismaClient, userId?: string,): Promise<string> {
    if (userId) {
        let user = await prisma.user.findOne({
            where: {twitchId: userId},
            include: {
                token: {
                    select: {
                        oAuthToken: true
                    }
                }
            }
        });
        return user.token.oAuthToken;
    } else {
        let token = await prisma.token.findOne({where: {ownerId: null}, select: {oAuthToken: true}});
        if (token) {
            return token.oAuthToken;
        }

        return (await requestAppToken([], prisma)).oAuthToken;
    }
}

async function refreshToken(oAuthToken: string, prisma: PrismaClient): Promise<string> {
    let token = await prisma.token.findOne({where: {oAuthToken: oAuthToken}});
    if (token) {
        let scopes = parseScopesArray(token.scopes);
        if (!token.ownerId) {
            await prisma.token.delete({
                where: {
                    id: token.id
                }
            });
            return (await requestAppToken(scopes, prisma)).oAuthToken;
        } else {
            let info = await oauth.refreshToken(token.refreshToken, process.env.CLIENT_ID, process.env.CLIENT_SECRET, scopes);
            token.oAuthToken = info.access_token;
            token.refreshToken = info.refresh_token;
            //TODO: Update refresh token endpoint to return token expiry and stuff
            prisma.token.update({
                where: {
                    id: token.id
                },
                data: {
                    oAuthToken: info.access_token,
                    refreshToken: info.refresh_token
                }
            });
            return info.access_token;
        }
    } else {
        throw new Error(`Token ${oAuthToken} does not exist in DB.`);
    }
}

async function requestAppToken(scopes: string[], prisma: PrismaClient): Promise<Token> {
    return new Promise((resolve, reject) => {
        let scopeString = scopes && scopes.length >= 1 ? '&' + encodeURIComponent(scopes.join(' ')) : '';
        let request = https.request(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials${scopeString}`,
            {method: 'POST'},
            (res) => {
                let body = "";
                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on("end", () => {
                    let token_info = JSON.parse(body);
                    prisma.token.create({
                        data: {
                            oAuthToken: token_info.access_token,
                            tokenExpiry: new Date(Date.now() + token_info.expires_in * 1000),
                            scopes: token_info.scope?.join(' ')
                        }
                    }).then(token => {
                        resolve(token)
                    }).catch((e) => {
                        reject(e);
                    });
                });
            });

        request.on('error', (e) => {
            reject(e);
        });

        request.end();
    });
}

export {
    sendGetTwitchRequest,
    sendPostTwitchRequest,
    getOAuthToken,
    refreshToken
}