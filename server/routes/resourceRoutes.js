const express = require('express');
const router = express.Router();
const { getResources } = require('../controllers/resourceController');

// Public route to get all resources
router.get('/', getResources);

module.exports = router;
