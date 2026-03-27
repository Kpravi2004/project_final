const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

router.get('/', propertyController.getProperties);
router.get('/my-properties', auth, propertyController.getMyProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth, propertyController.createProperty);
router.post('/:id/submit-amenities', auth, propertyController.submitAmenities);

module.exports = router;
