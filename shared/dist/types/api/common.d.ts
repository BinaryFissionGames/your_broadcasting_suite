export declare type ApiState = {
    needsReauth: boolean;
    error: boolean;
    userFacingErrorMessage?: string;
    errorId?: string;
};
export declare function isApiState(obj: any): obj is ApiState;
export declare type GenericResponse = {
    state: ApiState;
};
export declare function isGenericResponse(obj: any): obj is GenericResponse;
export declare type VerifyLoggedInResponse = {
    state: ApiState;
    loggedIn: boolean;
};
export declare type LogoutResponse = {
    state: ApiState;
};
