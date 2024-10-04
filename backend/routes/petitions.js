const router = require('express').Router();
let Petitions = require('../models/petitions.model');

router.route('/').get((req, res) => {
    let sortBy = req.query.sortBy || 'createdAt';
    let order = req.query.order === 'asc' ? 1 : -1;

    Petitions.find().sort({ [sortBy]: order })
        .then(petitions => res.json(petitions))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const content = req.body.content;

    const newPetition = new Petitions({ content });

    newPetition.save()
        .then(() => res.json('Petition added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/sign/:id').post((req, res) => {
    Petitions.findById(req.params.id)
        .then(petition => {
            petition.signatures += 1;

            petition.save()
                .then(() => res.json('Petition signed!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
