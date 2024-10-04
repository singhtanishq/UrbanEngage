const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeSchema = new Schema({
    content: { type: String, required: true },
}, {
    timestamps: true,
});

const Home = mongoose.model('Home', homeSchema);

module.exports = Home;
