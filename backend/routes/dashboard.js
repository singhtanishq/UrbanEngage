const router = require('express').Router();
let Dashboard = require('../models/dashboard.model');

router.route('/').get((req, res) => {
    Dashboard.find()
        .then(dashboard => {
            res.json(dashboard);
        })
        .catch(err => {
            res.status(400).json('Error: ' + err);
        });
});

router.route('/add').post((req, res) => {
    const content = req.body.content;
    const stats = {
        userCount: req.body.userCount || 0,
        postCount: req.body.postCount || 0,
        eventCount: req.body.eventCount || 0,
        petitionCount: req.body.petitionCount || 0,
        issueCount: req.body.issueCount || 0,
        volunteerCount: req.body.volunteerCount || 0,
    };
    const recentActivities = req.body.recentActivities || [];

    const newDashboard = new Dashboard({
        title: req.body.title,
        content,
        stats,
        recentActivities,
    });

    newDashboard.save()
        .then(() => res.json('Dashboard content added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
