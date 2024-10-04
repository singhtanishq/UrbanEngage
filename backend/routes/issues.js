const router = require('express').Router();
let Issues = require('../models/issues.model');

router.route('/').get((req, res) => {
    let sortBy = req.query.sortBy || 'createdAt';
    let order = req.query.order === 'asc' ? 1 : -1;
    let category = req.query.category || null;

    let query = category ? { category } : {};

    Issues.find(query).sort({ [sortBy]: order })
        .then(issues => res.json(issues))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const { content, category } = req.body;
    const newIssue = new Issues({ content, category });

    newIssue.save()
        .then(() => res.json('Issue added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/upvote/:id').post((req, res) => {
    Issues.findById(req.params.id)
        .then(issue => {
            issue.upvotes += 1;
            issue.save()
                .then(() => res.json('Upvoted!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/comment/:id').post((req, res) => {
    const { author, content } = req.body;
    const comment = { author, content };

    Issues.findById(req.params.id)
        .then(issue => {
            issue.comments.push(comment);
            issue.save()
                .then(() => res.json('Comment added!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
