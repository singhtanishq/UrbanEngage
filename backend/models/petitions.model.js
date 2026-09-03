const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// `content` is the petition title (legacy field name kept for compatibility).
const petitionsSchema = new Schema({
    content: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    goal: { type: Number, default: 100, min: 1 },
    deadline: { type: Date },
    signatures: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true,
});

const Petitions = mongoose.model('Petitions', petitionsSchema);

module.exports = Petitions;
