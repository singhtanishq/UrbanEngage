const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petitionsSchema = new Schema({
    content: { type: String, required: true },
    signatures: { type: Number, default: 0 }, 
}, {
    timestamps: true,
});

const Petitions = mongoose.model('Petitions', petitionsSchema);

module.exports = Petitions;
