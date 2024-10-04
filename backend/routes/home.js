const router = require('express').Router();
let Home = require('../models/home.model');

router.route('/').get((req, res) => {
    Home.find()
        .then(home => res.json(home))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const content = req.body.content;

    const newHome = new Home({ content });

    newHome.save()
        .then(() => res.json('Home content added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
