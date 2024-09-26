const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const issuesSchema = new Schema({
    content: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    upvotes: { type: Number, default: 0 },
    comments: [commentSchema],
}, {
    timestamps: true,
});

const Issues = mongoose.model('Issues', issuesSchema);
module.exports = Issues;
