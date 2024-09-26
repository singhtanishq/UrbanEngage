const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollsSchema = new Schema({
    description: { type: String, required: true },
    category: { type: String, required: true },
    options: { type: [String], required: true },
    votes: { type: [Number], default: [0, 0, 0, 0, 0] },
}, {
    timestamps: true,
});

const Polls = mongoose.model('Polls', pollsSchema);

module.exports = Polls;
