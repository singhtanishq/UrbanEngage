const express = require('express');
const Volunteers = require('../models/volunteers.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, isEmail } = require('../middleware/validate');

const router = express.Router();

const CATEGORIES = ['Education', 'Community Service', 'Healthcare'];
const SORTABLE = ['createdAt', 'name', 'registrationDate'];

router.get('/', asyncHandler(async (req, res) => {
    // Legacy clients sent sortBy=A-Z / sortBy=date; map them onto real fields.
    const legacy = { 'A-Z': 'name', date: 'registrationDate' };
    const sortBy = legacy[req.query.sortBy] || req.query.sortBy;
    const sortField = SORTABLE.includes(sortBy) ? sortBy : 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const query = {};
    if (req.query.category) {
        query.category = cleanString(req.query.category, 'Category', { max: 60 });
    }

    const volunteers = await Volunteers.find(query).sort({ [sortField]: order });
    res.json(volunteers);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const name = cleanString(required(req.body.name, 'Name'), 'Name', { max: 80, min: 2 });
    const emailRaw = cleanString(required(req.body.email, 'Email'), 'Email', { max: 254 });
    if (!isEmail(emailRaw)) throw new HttpError(400, 'Invalid email address');
    const email = emailRaw.toLowerCase();

    const category = required(req.body.category, 'Category');
    if (!CATEGORIES.includes(category)) {
        throw new HttpError(400, `Category must be one of: ${CATEGORIES.join(', ')}`);
    }

    const experience = cleanString(req.body.experience, 'Experience', { max: 500 });
    const availability = cleanString(required(req.body.availability, 'Availability'), 'Availability', { max: 200 });

    const existing = await Volunteers.findOne({ email });
    if (existing) {
        throw new HttpError(409, 'Duplicate email found. We allow one registration per person only.');
    }

    const volunteer = await Volunteers.create({ name, email, category, experience, availability });
    res.status(201).json({ message: 'Volunteer successfully registered!', volunteer });
}));

module.exports = router;
