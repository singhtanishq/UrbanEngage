const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsSchema = new Schema({
    content: { type: String, required: true },
    attendees: { type: Number, default: 0 }, 
}, {
    timestamps: true,
});

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;
