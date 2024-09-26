const router = require('express').Router();
let Volunteers = require('../models/volunteers.model');

router.route('/').get((req, res) => {
    const { sortBy, category } = req.query;

    let query = {};
    if (category) {
        query.category = category;
    }

    let sortOption = {};
    if (sortBy === 'A-Z') {
        sortOption.name = 1;
    } else if (sortBy === 'date') {
        sortOption.registrationDate = -1;
    }

    Volunteers.find(query)
        .sort(sortOption)
        .then(volunteers => res.json(volunteers))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const { name, email, category, experience, availability } = req.body;

    Volunteers.findOne({ email })
        .then(existingVolunteer => {
            if (existingVolunteer) {
                return res.status(400).json({ error: 'Duplicate email found. We allow one registration per person only.' });
            } else {
                const newVolunteer = new Volunteers({
                    name,
                    email,
                    category,
                    experience,
                    availability
                });

                newVolunteer.save()
                    .then(() => res.json('Volunteer successfully registered!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
