const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumsSchema = new Schema({
    content: { type: String, required: true },
    threads: [{
        title: { type: String, required: true },
        // Last activity time for the thread. Set explicitly by the routes —
        // no schema default, so legacy threads (without a timestamp) stay
        // undefined and the client falls back to the forum's creation date.
        postedAt: { type: Date },
        posts: [{
            author: { type: String, required: true },
            content: { type: String, required: true },
        }],
    }],
}, {
    timestamps: true,
});

const Forums = mongoose.model('Forums', forumsSchema);

module.exports = Forums;
