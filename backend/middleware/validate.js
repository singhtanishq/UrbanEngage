const HttpError = require('../utils/httpError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Throws 400 when `value` is absent after trimming (strings) or falsy. */
function required(value, field) {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        throw new HttpError(400, `${field} is required`);
    }
    return value;
}

/** Trims strings, enforces a max length, and returns the cleaned value. */
function cleanString(value, field, { max = 500, min = 0 } = {}) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
    const trimmed = value.trim();
    if (trimmed.length < min) throw new HttpError(400, `${field} must be at least ${min} characters`);
    if (trimmed.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
    return trimmed;
}

function isEmail(value) {
    return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

/** Whitelist-based sort field/order resolution for list endpoints. */
function sortParams(query, allowedFields, defaultField) {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
    const order = query.order === 'asc' ? 1 : -1;
    return { [sortBy]: order };
}

function isValidObjectId(id) {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = { required, cleanString, isEmail, sortParams, isValidObjectId };
