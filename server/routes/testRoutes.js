const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateTest, submitTest, getTestResult } = require('../controllers/testController');

router.post('/generate', protect, generateTest);
router.post('/:attemptId/submit', protect, submitTest);
router.get('/:attemptId', protect, getTestResult);

module.exports = router;
