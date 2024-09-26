const express = require('express');
const router = express.Router();
const Feature = require('../models/feature.model');

router.get('/', (req, res) => {
    Feature.find()
        .then(features => res.json(features))
        .catch(err => res.status(400).json(`Error: ${err}`));
});

router.post('/add', (req, res) => {
    const { name, description } = req.body;

    const newFeature = new Feature({
        name,
        description,
    });

    newFeature.save()
        .then(() => res.json('Feature added!'))
        .catch(err => res.status(400).json(`Error: ${err}`));
});

router.put('/update/:id', (req, res) => {
    Feature.findById(req.params.id)
        .then(feature => {
            feature.name = req.body.name;
            feature.description = req.body.description;
            feature.save()
                .then(() => res.json('Feature updated!'))
                .catch(err => res.status(400).json(`Error: ${err}`));
        })
        .catch(err => res.status(400).json(`Error: ${err}`));
});

router.delete('/:id', (req, res) => {
    Feature.findByIdAndDelete(req.params.id)
        .then(() => res.json('Feature deleted.'))
        .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;
