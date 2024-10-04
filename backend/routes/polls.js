const router = require('express').Router();
let Polls = require('../models/polls.model');

router.route('/').get((req, res) => {
    Polls.find()
        .then(polls => res.json(polls))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const { description, category, options } = req.body;

    const newPolls = new Polls({ description, category, options });

    newPolls.save()
        .then(() => res.json('Poll created!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/vote/:id').post((req, res) => {
    const { id } = req.params;
    const { optionIndex } = req.body;

    Polls.findById(id)
        .then(poll => {
            if (poll) {
                poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
                poll.save()
                    .then(() => res.json('Vote counted!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            } else {
                res.status(404).json('Poll not found');
            }
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
