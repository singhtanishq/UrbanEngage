const express = require('express');
const Events = require('../models/events.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, sortParams, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

const SORTABLE = ['createdAt', 'content', 'date', 'attendees'];

router.get('/', asyncHandler(async (req, res) => {
    const sort = sortParams(req.query, SORTABLE, 'createdAt');
    const events = await Events.find().sort(sort);
    res.json(events);
}));

// Accepts `{ content }` (legacy: title only) or the richer
// `{ content, description, location, date, category }` payload.
router.post('/add', asyncHandler(async (req, res) => {
    const content = cleanString(required(req.body.content, 'Event title'), 'Event title', { max: 120, min: 3 });
    const description = cleanString(req.body.description, 'Description', { max: 1000 });
    const location = cleanString(req.body.location, 'Location', { max: 200 });
    const category = cleanString(req.body.category, 'Category', { max: 60 }) || 'Community';

    let date = undefined;
    if (req.body.date) {
        const parsed = new Date(req.body.date);
        if (Number.isNaN(parsed.getTime())) throw new HttpError(400, 'Invalid event date');
        date = parsed;
    }

    const event = await Events.create({ content, description, location, category, date });
    res.status(201).json(event);
}));

router.post('/rsvp/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Event not found');

    // Atomic increment avoids the lost-update race in the old read-modify-write.
    const event = await Events.findByIdAndUpdate(
        req.params.id,
        { $inc: { attendees: 1 } },
        { new: true }
    );
    if (!event) throw new HttpError(404, 'Event not found');

    res.json({ message: 'RSVP confirmed!', attendees: event.attendees });
}));

router.delete('/delete', asyncHandler(async (req, res) => {
    // Destructive bulk delete kept for compatibility, but requires explicit confirm.
    if (req.query.confirm !== 'true') {
        throw new HttpError(400, 'Pass ?confirm=true to delete all events');
    }
    await Events.deleteMany({});
    res.json({ message: 'All events deleted!' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Event not found');
    const event = await Events.findByIdAndDelete(req.params.id);
    if (!event) throw new HttpError(404, 'Event not found');
    res.json({ message: 'Event deleted!' });
}));

module.exports = router;
