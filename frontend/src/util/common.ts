function wait(ms: number): Promise<void> {
    /*eslint-disable @typescript-eslint/no-unused-vars*/
    return new Promise((resolve, _) => {
        setTimeout(resolve, ms);
    });
}

async function doWithMinTime<T>(minTimeMs: number, promise: Promise<T>): Promise<T> {
    const waitTimer = wait(minTimeMs);
    const promiseResult = await promise;
    await waitTimer;
    return promiseResult;
}

export {wait, doWithMinTime};
