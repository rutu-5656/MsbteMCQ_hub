const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSubjects, getSubjectById, getChapterQuestions, submitAnswer } = require('../controllers/subjectController');

// Protected: any logged-in user
router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubjectById);
router.get('/chapters/:chapterId/questions', protect, getChapterQuestions);
router.post('/answer', protect, submitAnswer);

module.exports = router;
