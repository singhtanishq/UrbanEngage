const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// `content` is the event title (legacy field name kept for compatibility).
// The richer fields are optional so existing documents keep working.
const eventsSchema = new Schema({
    content: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    category: { type: String, default: 'Community', trim: true },
    date: { type: Date },
    attendees: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true,
});

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;
