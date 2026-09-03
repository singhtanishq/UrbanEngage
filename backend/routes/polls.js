const express = require('express');
const Polls = require('../models/polls.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

const MAX_OPTIONS = 5;

router.get('/', asyncHandler(async (req, res) => {
    const polls = await Polls.find().sort({ createdAt: -1 });
    res.json(polls);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const description = cleanString(required(req.body.description, 'Description'), 'Description', { max: 300, min: 5 });
    const category = cleanString(required(req.body.category, 'Category'), 'Category', { max: 60 });

    if (!Array.isArray(req.body.options)) throw new HttpError(400, 'Options must be an array');
    const options = req.body.options
        .map((option) => cleanString(option, 'Option', { max: 100 }))
        .filter((option) => option.length > 0);

    if (options.length < 2) throw new HttpError(400, 'A poll needs at least 2 options');
    if (options.length > MAX_OPTIONS) throw new HttpError(400, `A poll allows at most ${MAX_OPTIONS} options`);
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
        throw new HttpError(400, 'Poll options must be unique');
    }

    // Vote counters must line up with the option list (legacy docs defaulted to five).
    const poll = await Polls.create({ description, category, options, votes: options.map(() => 0) });
    res.status(201).json(poll);
}));

router.post('/vote/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Poll not found');

    const optionIndex = Number(req.body.optionIndex);
    if (!Number.isInteger(optionIndex)) throw new HttpError(400, 'optionIndex must be an integer');

    const poll = await Polls.findById(req.params.id);
    if (!poll) throw new HttpError(404, 'Poll not found');

    // Bounds check: the old version accepted any index and silently corrupted the votes array.
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new HttpError(400, 'Invalid option selected');
    }

    poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
    await poll.save();

    res.json({ message: 'Vote counted!', votes: poll.votes });
}));

module.exports = router;
