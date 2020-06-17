import got from "got";
import createHttpError = require("http-errors");

type ValidateResponse = {
    client_id: string
    login: string
    scopes: string[]
    user_id: string
}

async function validateToken(access_token: string): Promise<ValidateResponse> {
    let url = process.env.NODE_ENV === 'development' ? process.env.MOCK_VALIDATE_URL : 'https://id.twitch.tv/oauth2/validate';
    let response = await got.get(url, {
        headers: {
            'Authorization': `OAuth ${access_token}`
        }
    });

    if (Math.floor(response.statusCode / 100) !== 2) {
        throw createHttpError(response.statusCode, "Couldn't validate accesss token!");
    }

    return <ValidateResponse>JSON.parse(response.body);
}

export {
    validateToken
}