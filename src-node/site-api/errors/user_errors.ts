import {GenericError} from "./common";

export class NeedsReAuthError extends GenericError {
    constructor() {
        super('User is not signed in!');
        this.userFacingMessage = 'You have been signed out and need to re-authenticate!';
        this.needsReauth = true;
        this.statusCode = 401;
    }
}