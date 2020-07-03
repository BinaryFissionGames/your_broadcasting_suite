import {GenericError} from "./common";

export class NeedsReAuthError extends GenericError {
    constructor() {
        super('User is not signed in!');
        this.userFacingMessage = 'You have been signed out and need to re-authenticate!';
        this.needsReauth = true;
        this.statusCode = 401;
    }
}

export class QueueNotFound extends GenericError {
    constructor() {
        super('Requested queue not found!');
        this.userFacingMessage = 'Requested queue not found!';
        this.needsReauth = false;
        this.statusCode = 400;
    }
}