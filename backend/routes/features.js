const express = require('express');
const Feature = require('../models/feature.model');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { required, cleanString, isValidObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
    const features = await Feature.find();
    res.json(features);
}));

router.post('/add', asyncHandler(async (req, res) => {
    const name = cleanString(required(req.body.name, 'Name'), 'Name', { max: 100, min: 2 });
    const description = cleanString(req.body.description, 'Description', { max: 1000 });

    const feature = await Feature.create({ name, description });
    res.status(201).json({ message: 'Feature added!', feature });
}));

router.put('/update/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Feature not found');

    const name = cleanString(required(req.body.name, 'Name'), 'Name', { max: 100, min: 2 });
    const description = cleanString(req.body.description, 'Description', { max: 1000 });

    const feature = await Feature.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true, runValidators: true }
    );
    if (!feature) throw new HttpError(404, 'Feature not found');

    res.json({ message: 'Feature updated!', feature });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Feature not found');

    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) throw new HttpError(404, 'Feature not found');

    res.json({ message: 'Feature deleted.' });
}));

module.exports = router;
