const express = require('express');
const Dashboard = require('../models/dashboard.model');
const Issue = require('../models/issues.model');
const Event = require('../models/events.model');
const Petition = require('../models/petitions.model');
const Volunteer = require('../models/volunteers.model');
const User = require('../models/accounts.model');
const Forums = require('../models/forums.model');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Legacy content endpoint (kept for compatibility).
router.get('/', asyncHandler(async (req, res) => {
    const dashboard = await Dashboard.find();
    res.json(dashboard);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const stats = {
        userCount: req.body.userCount || 0,
        postCount: req.body.postCount || 0,
        eventCount: req.body.eventCount || 0,
        petitionCount: req.body.petitionCount || 0,
        issueCount: req.body.issueCount || 0,
        volunteerCount: req.body.volunteerCount || 0,
    };

    const dashboard = await Dashboard.create({
        title: req.body.title,
        content: req.body.content,
        stats,
        recentActivities: req.body.recentActivities || [],
    });

    res.status(201).json({ message: 'Dashboard content added!', dashboard });
}));

// Live platform stats: real collection counts plus a recent-activity feed
// assembled from the newest issues, events, and petitions.
router.get('/stats', asyncHandler(async (req, res) => {
    const [users, events, petitions, issues, volunteers, forumDocs, recentIssues, recentEvents, recentPetitions] =
        await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Petition.countDocuments(),
            Issue.countDocuments(),
            Volunteer.countDocuments(),
            Forums.aggregate([
                { $project: { threadCount: { $size: { $ifNull: ['$threads', []] } } } },
                { $group: { _id: null, total: { $sum: '$threadCount' } } },
            ]),
            Issue.find().sort({ createdAt: -1 }).limit(4).select('content createdAt status'),
            Event.find().sort({ createdAt: -1 }).limit(3).select('content createdAt'),
            Petition.find().sort({ createdAt: -1 }).limit(3).select('content createdAt'),
        ]);

    const activities = [
        ...recentIssues.map((doc) => ({
            type: 'issue',
            title: 'Issue Reported',
            description: doc.content,
            timestamp: doc.createdAt,
        })),
        ...recentEvents.map((doc) => ({
            type: 'event',
            title: 'Event Created',
            description: doc.content,
            timestamp: doc.createdAt,
        })),
        ...recentPetitions.map((doc) => ({
            type: 'petition',
            title: 'Petition Created',
            description: doc.content,
            timestamp: doc.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 8);

    res.json({
        stats: {
            userCount: users,
            eventCount: events,
            petitionCount: petitions,
            issueCount: issues,
            volunteerCount: volunteers,
            postCount: forumDocs[0]?.total || 0,
        },
        activities,
    });
}));

module.exports = router;
