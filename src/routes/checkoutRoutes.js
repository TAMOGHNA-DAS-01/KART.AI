const express = require('express');
const { createDemoOrder } = require('../controllers/checkoutController');
const { optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/demo-order', optionalProtect, createDemoOrder);

module.exports = router;
