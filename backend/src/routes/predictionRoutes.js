const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, predictionController.predictPrice);
router.post('/train', auth, admin, predictionController.trainModels);

module.exports = router;
