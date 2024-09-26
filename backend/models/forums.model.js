const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumsSchema = new Schema({
    content: { type: String, required: true },
    threads: [{
        title: { type: String, required: true },
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
