const express = require('express');
const Issues = require('../models/issues.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, sortParams, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

const SORTABLE = ['createdAt', 'content', 'upvotes'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

router.get('/', asyncHandler(async (req, res) => {
    const sort = sortParams(req.query, SORTABLE, 'createdAt');
    const query = {};
    if (req.query.category) query.category = cleanString(req.query.category, 'Category', { max: 60 });
    if (req.query.status && STATUSES.includes(req.query.status)) query.status = req.query.status;

    const issues = await Issues.find(query).sort(sort);
    res.json(issues);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const content = cleanString(required(req.body.content, 'Issue description'), 'Issue description', { max: 1000, min: 10 });
    const category = cleanString(required(req.body.category, 'Category'), 'Category', { max: 60 });
    const author = cleanString(req.body.author, 'Author', { max: 80 }) || 'Anonymous';

    const issue = await Issues.create({ content, category, author });
    res.status(201).json(issue);
}));

router.post('/upvote/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Issue not found');

    const issue = await Issues.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
    if (!issue) throw new HttpError(404, 'Issue not found');

    res.json({ message: 'Upvoted!', upvotes: issue.upvotes });
}));

router.post('/comment/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Issue not found');

    const content = cleanString(required(req.body.content, 'Comment'), 'Comment', { max: 500, min: 1 });
    const author = cleanString(req.body.author, 'Author', { max: 80 }) || 'Anonymous';

    const issue = await Issues.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: { author, content } } },
        { new: true }
    );
    if (!issue) throw new HttpError(404, 'Issue not found');

    res.status(201).json({ message: 'Comment added!', comments: issue.comments });
}));

router.post('/status/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Issue not found');

    const status = required(req.body.status, 'Status');
    if (!STATUSES.includes(status)) throw new HttpError(400, `Status must be one of: ${STATUSES.join(', ')}`);

    const issue = await Issues.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!issue) throw new HttpError(404, 'Issue not found');

    res.json({ message: 'Status updated!', status: issue.status });
}));

module.exports = router;
