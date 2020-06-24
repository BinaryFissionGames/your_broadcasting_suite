import * as crypto from 'crypto';

export class GenericError extends Error {
    public userFacingMessage: string;
    public errorId: string;
    public statusCode: number;
    public needsReauth: boolean;

    constructor(msg: string) {
        super(msg);
        this.userFacingMessage = 'An internal server error occurred. If this error persists, please contact us by sending an email to support@binaryfissiongames.com!';
        this.errorId = crypto.randomBytes(4).toString('hex'); // Random 8 bytes to identify this error.
        this.statusCode = 500;
        this.needsReauth = false;
    }
}

export class InvalidPayloadError extends GenericError {
    constructor(type: string, endpoint: string) {
        super(`Payload does not match type ${type} for endpoint ${endpoint}.`);
        //This should not happen under normal operation, so there is no real "user facing error"/
        //The default "internal server error" should suffice for now.
    }
}