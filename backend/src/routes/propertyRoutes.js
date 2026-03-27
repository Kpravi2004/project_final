const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/', propertyController.getProperties);
router.get('/my-properties', auth, propertyController.getMyProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth, propertyController.createOrUpdateDraft);
router.post('/finalize', auth, upload.array('media', 10), propertyController.finalizeProperty);
router.post('/:id/submit-amenities', auth, propertyController.submitAmenities);

module.exports = router;