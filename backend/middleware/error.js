const HttpError = require('../utils/httpError');

/** 404 for unmatched routes, then the central JSON error handler. */
function notFound(req, res, next) {
    next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = err.status && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const isServer = status >= 500;

    if (isServer) {
        console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
        if (process.env.NODE_ENV !== 'production') console.error(err.stack);
    }

    res.status(status).json({
        message: isServer && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error',
    });
}

module.exports = { notFound, errorHandler };
