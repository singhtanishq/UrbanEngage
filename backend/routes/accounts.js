const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/accounts.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, isEmail } = require('../middleware/validate');
const { signToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

const BCRYPT_ROUNDS = 10;
const publicUser = (user) => ({ name: user.name, email: user.email });

router.post('/signup', asyncHandler(async (req, res) => {
    const name = cleanString(required(req.body.name, 'Name'), 'Name', { max: 80, min: 2 });
    const email = cleanString(required(req.body.email, 'Email'), 'Email', { max: 254 }).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!isEmail(email)) throw new HttpError(400, 'Invalid email address');
    if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
    if (password.length > 128) throw new HttpError(400, 'Password must be at most 128 characters');

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new HttpError(409, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User created' });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const email = cleanString(required(req.body.email, 'Email'), 'Email', { max: 254 }).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    // Uniform message so the endpoint cannot be used to enumerate accounts.
    const invalid = new HttpError(401, 'Invalid email or password');
    const user = await User.findOne({ email });
    if (!user) throw invalid;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw invalid;

    const token = signToken(user._id);
    res.json({ ...publicUser(user), token });
}));

router.post('/update', asyncHandler(async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) throw new HttpError(401, 'Session expired, please log in again');

    const user = await User.findById(decoded.id);
    if (!user) throw new HttpError(404, 'User not found');

    if (req.body.name !== undefined) {
        user.name = cleanString(required(req.body.name, 'Name'), 'Name', { max: 80, min: 2 });
    }

    const password = req.body.password;
    if (password) {
        if (typeof password !== 'string' || password.length < 8) {
            throw new HttpError(400, 'Password must be at least 8 characters');
        }
        user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    await user.save();
    res.json({ message: 'Profile updated', ...publicUser(user) });
}));

// Current profile from a bearer token; used by the client to restore sessions.
router.get('/me', asyncHandler(async (req, res) => {
    const decoded = verifyToken(req);
    if (!decoded) throw new HttpError(401, 'Session expired, please log in again');

    const user = await User.findById(decoded.id);
    if (!user) throw new HttpError(404, 'User not found');

    res.json({ ...publicUser(user), token: req.headers.authorization?.slice(7) });
}));

module.exports = router;
