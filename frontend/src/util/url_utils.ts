function getApiUrlWithPath(path: string): string {
    /*eslint-disable @typescript-eslint/ban-ts-comment*/
    //We need this because of the below:
    //@ts-ignore API_SERVER is a define filled in by webpack before compiling
    return new URL(path, API_SERVER).href;
}

export {getApiUrlWithPath};
