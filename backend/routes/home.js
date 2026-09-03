const express = require('express');
const Home = require('../models/home.model');
const asyncHandler = require('../utils/asyncHandler');
const { required, cleanString } = require('../middleware/validate');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
    const home = await Home.find();
    res.json(home);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const content = cleanString(required(req.body.content, 'Content'), 'Content', { max: 2000 });
    const home = await Home.create({ content });
    res.status(201).json({ message: 'Home content added!', home });
}));

module.exports = router;
