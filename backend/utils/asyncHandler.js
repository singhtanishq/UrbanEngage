/**
 * Wraps an async route handler so any rejection is forwarded to the
 * central error middleware instead of crashing the process.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
