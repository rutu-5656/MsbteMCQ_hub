const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getUserProgress,
  getSubjectsWithChapters,
  createSubject,
  createChapter,
  bulkUploadQuestions
} = require('../controllers/adminController');
const { uploadResource } = require('../controllers/resourceController');

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id/progress', getUserProgress);

// Subjects & Chapters
router.get('/subjects', getSubjectsWithChapters);
router.post('/subjects', createSubject);
router.post('/subjects/:subjectId/chapters', createChapter);

// Bulk Upload
router.post('/chapters/:chapterId/questions/bulk', bulkUploadQuestions);

// Resources
router.post('/resources', upload.single('file'), uploadResource);

module.exports = router;
