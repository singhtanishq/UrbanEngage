const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dashboardSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    stats: {
        userCount: { type: Number, required: true, default: 0 },
        postCount: { type: Number, required: true, default: 0 },
        eventCount: { type: Number, required: true, default: 0 },
        petitionCount: { type: Number, required: true, default: 0 },
        issueCount: { type: Number, required: true, default: 0 },
        volunteerCount: { type: Number, required: true, default: 0 }
    },
    recentActivities: [
        {
            title: { type: String },
            description: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true,
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;
