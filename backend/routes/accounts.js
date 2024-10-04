const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/accounts.model');

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ name: user.name, email: user.email, token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/update', async (req, res) => {
    const { name, password, token } = req.body;

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ message: 'User not found' });

        user.name = name || user.name;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        res.json({ message: 'Profile updated', name: user.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
});

module.exports = router;
