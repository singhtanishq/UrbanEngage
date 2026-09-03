const express = require('express');
const Petitions = require('../models/petitions.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, sortParams, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

const SORTABLE = ['createdAt', 'content', 'signatures'];

router.get('/', asyncHandler(async (req, res) => {
    const sort = sortParams(req.query, SORTABLE, 'createdAt');
    const petitions = await Petitions.find().sort(sort);
    res.json(petitions);
}));

// Accepts `{ content }` (legacy) or `{ content, description, goal, deadline }`.
router.post('/add', asyncHandler(async (req, res) => {
    const content = cleanString(required(req.body.content, 'Petition title'), 'Petition title', { max: 150, min: 5 });
    const description = cleanString(req.body.description, 'Description', { max: 2000 });

    const goal = req.body.goal === undefined ? 100 : Number(req.body.goal);
    if (!Number.isInteger(goal) || goal < 1 || goal > 1000000) {
        throw new HttpError(400, 'Goal must be a whole number between 1 and 1,000,000');
    }

    let deadline = undefined;
    if (req.body.deadline) {
        deadline = new Date(req.body.deadline);
        if (Number.isNaN(deadline.getTime())) throw new HttpError(400, 'Invalid deadline date');
    }

    const petition = await Petitions.create({ content, description, goal, deadline });
    res.status(201).json(petition);
}));

router.post('/sign/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Petition not found');

    const petition = await Petitions.findByIdAndUpdate(
        req.params.id,
        { $inc: { signatures: 1 } },
        { new: true }
    );
    if (!petition) throw new HttpError(404, 'Petition not found');

    res.json({ message: 'Petition signed!', signatures: petition.signatures });
}));

module.exports = router;
