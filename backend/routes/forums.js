const router = require('express').Router();
let Forums = require('../models/forums.model');

router.route('/').get((req, res) => {
    Forums.find()
        .then(forums => res.json(forums))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    console.log('Received request to add thread:', req.body);
    const { title, author, content } = req.body;

    const newThread = {
        title,
        posts: [{ author, content }],
    };

    Forums.findOneAndUpdate(
        { content: "Discussions" },
        { $push: { threads: newThread } },
        { new: true, upsert: true }
    )
    .then(() => res.json('Thread added!'))
    .catch(err => {
        console.error('Error adding thread:', err);
        res.status(400).json('Error: ' + err);
    });
});

module.exports = router;
