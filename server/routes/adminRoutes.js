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
  bulkUploadQuestions,
  deleteSubject,
  getMessages,
  markMessageRead,
  deleteMessage,
  deleteUser
} = require('../controllers/adminController');
const { uploadResource, deleteResource } = require('../controllers/resourceController');

// Multer Setup - Use memory storage for Supabase upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id/progress', getUserProgress);
router.delete('/users/:id', deleteUser); 

// Subjects & Chapters
router.get('/subjects', getSubjectsWithChapters);
router.post('/subjects', createSubject);
router.delete('/subjects/:subjectId', deleteSubject);
router.post('/subjects/:subjectId/chapters', createChapter);

// Bulk Upload
router.post('/chapters/:chapterId/questions/bulk', bulkUploadQuestions);

// Resources
router.post('/resources', upload.single('file'), uploadResource);
router.delete('/resources/:id', deleteResource);

// Messages
router.get('/messages', getMessages);
router.patch('/messages/:id/read', markMessageRead);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
