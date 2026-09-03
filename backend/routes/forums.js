const express = require('express');
const Forums = require('../models/forums.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
    const forums = await Forums.find().sort({ createdAt: 1 });
    res.json(forums);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const title = cleanString(required(req.body.title, 'Thread title'), 'Thread title', { max: 150, min: 3 });
    const author = cleanString(required(req.body.author, 'Author'), 'Author', { max: 80, min: 2 });
    const content = cleanString(required(req.body.content, 'Post'), 'Post', { max: 2000, min: 3 });

    const forum = await Forums.findOneAndUpdate(
        { content: 'Discussions' },
        { $push: { threads: { title, postedAt: new Date(), posts: [{ author, content }] } } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Thread added!', forum });
}));

// Reply to a thread by its subdocument id (embedded subdocs get an _id automatically).
router.post('/threads/:threadId/reply', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.threadId)) throw new HttpError(404, 'Thread not found');

    const author = cleanString(required(req.body.author, 'Author'), 'Author', { max: 80, min: 2 });
    const content = cleanString(required(req.body.content, 'Reply'), 'Reply', { max: 2000, min: 1 });

    const forum = await Forums.findOneAndUpdate(
        { 'threads._id': req.params.threadId },
        { $push: { 'threads.$.posts': { author, content } }, $set: { 'threads.$.postedAt': new Date() } },
        { new: true }
    );
    if (!forum) throw new HttpError(404, 'Thread not found');

    const thread = forum.threads.id(req.params.threadId);
    res.status(201).json({ message: 'Reply added!', thread });
}));

module.exports = router;
