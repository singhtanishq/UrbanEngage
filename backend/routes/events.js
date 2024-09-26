const router = require('express').Router();
let Events = require('../models/events.model');

router.route('/').get((req, res) => {
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    Events.find().sort({ [sortBy]: sortOrder })
        .then(events => res.json(events))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const content = req.body.content;

    const newEvents = new Events({ content });

    newEvents.save()
        .then(() => res.json('Event added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/rsvp/:id').post((req, res) => {
    Events.findById(req.params.id)
        .then(event => {
            event.attendees += 1;
            event.save()
                .then(() => res.json('RSVP confirmed!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
