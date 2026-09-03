const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ue_dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Verifies a bearer token (Authorization header or `token` body field). */
function verifyToken(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : (req.body && req.body.token);
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = { signToken, verifyToken, JWT_SECRET };
