const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    category: { type: String, required: true },  
    registrationDate: { type: Date, default: Date.now },  
    experience: { type: String },  
    availability: { type: String, required: true },  
    feedback: [{ type: String }], 
}, {
    timestamps: true,
});

const Volunteers = mongoose.model('Volunteers', volunteersSchema);

module.exports = Volunteers;
