import got from 'got';

async function doTwitchRequestInternal(method: "POST" | "GET" | "PUT",
                                       url: string,
                                       getOAuthTokenCallback: (userId?: string) => string,
                                       refreshOAuthTokenCallback: (token: string) => string,
                                       body?: string): Promise<Buffer> {

    let req = await got(url, {
        method,
        body,
    });

    return Buffer.alloc(0);
}