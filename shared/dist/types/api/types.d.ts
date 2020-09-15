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
export declare type QueueItem = {
    id: number;
    type: number;
    description: string;
    icon: string;
    estimated_duration?: number;
};
export declare type AllQueueItemsResponse = {
    state: ApiState;
    items: QueueItem[];
};
export declare type AllQueueItemsRequest = {
    queueId: number;
};
export declare function isAllQueueItemsRequest(obj: any): obj is AllQueueItemsRequest;
