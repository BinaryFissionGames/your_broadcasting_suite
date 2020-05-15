import * as https from "https";
import * as oauth from "twitch-oauth-authorization-code-express"
import {Token} from "./db/models/token";
import {User} from "./db/models/user";

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

async function getOAuthToken(userId?: string): Promise<string> {
    if (userId) {
        let user = await User.findOne({where: {twitchId: userId}});
        return (await Token.findOne({where: {userId: user.id}, attributes: ['oAuthToken']})).oAuthToken;
    } else {
        let token = await Token.findOne({where: {userId: null}, attributes: ['oAuthToken']});
        if (token) {
            return token.oAuthToken;
        }

        return (await requestAppToken([])).oAuthToken;
    }
}

async function refreshToken(oAuthToken: string): Promise<string> {
    let token = await Token.findOne({where: {oAuthToken: oAuthToken}});
    if (token) {
        if(!token.userId){
            let scopes = token.scopes;
            let scopeArray: string[];
            if (scopes && scopes !== '') {
                scopeArray = scopes.split(' ');
            }

            if (!scopeArray) {
                scopeArray = [];
            }

            token.destroy();
            return (await requestAppToken(scopeArray)).oAuthToken;
        }
    } else {
        let info = await oauth.refreshToken(token.refreshToken, process.env.CLIENT_ID, process.env.CLIENT_SECRET, token.scopesArray);
        token.oAuthToken = info.access_token;
        token.refreshToken = info.refresh_token;
        //TODO: Update refresh token endpoint to return token expiry and stuff
        await token.save();
        return info.access_token;
    }
}

async function requestAppToken(scopes: string[]): Promise<Token> {
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
                    Token.create({
                        oAuthToken: token_info.access_token,
                        tokenExpiry: new Date(Date.now() + token_info.expires_in * 1000),
                        scopes: token_info.scope?.join(' ')
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