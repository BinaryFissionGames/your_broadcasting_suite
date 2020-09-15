//General ApiState that should be returned w/ every response
import {hasAndIsOfType, mayHaveAndIsOfType} from "../helper";

export type ApiState = {
    needsReauth: boolean, // User needs to be redirected to re-authorize
    error: boolean, // Is the request in an error state?
    userFacingErrorMessage?: string, // A user facing error message. Made to be shown to the user in a modal or other method
    errorId?: string
}

export function isApiState(obj: any): obj is ApiState {
    return obj && typeof obj === 'object' &&
        hasAndIsOfType(obj, 'needsReauth', 'boolean') &&
        hasAndIsOfType(obj, 'error', "boolean") &&
        mayHaveAndIsOfType(obj, 'userFacingErrorMessage', 'string') &&
        mayHaveAndIsOfType(obj, 'errorId', 'string');
}

export type GenericResponse = {
    state: ApiState
}

export function isGenericResponse(obj: any): obj is GenericResponse {
    return obj && typeof obj === 'object' && obj.state && isApiState(obj.state);
}

export type VerifyLoggedInResponse = {
    state: ApiState,
    loggedIn: boolean
}

export type LogoutResponse = {
    state: ApiState
}

