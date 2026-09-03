/**
 * Operational error with an HTTP status attached. Anything that is not an
 * HttpError reaching the error middleware is treated as a 500.
 */
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.isOperational = true;
    }
}

module.exports = HttpError;
