const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// ─── Dashboard Stats ───────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalAttempts, totalSubjects] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.userProgress.count(),
      prisma.subject.count()
    ]);

    const correctAttempts = await prisma.userProgress.count({
      where: { isCorrect: true }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    res.json({
      totalUsers,
      totalQuestions,
      totalAttempts,
      totalSubjects,
      correctAttempts,
      accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
      recentUsers
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── All Users with Stats ──────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { progress: true }
        }
      }
    });

    // Enrich with correct-answer counts
    const enriched = await Promise.all(
      users.map(async (user) => {
        const correctCount = await prisma.userProgress.count({
          where: { userId: user.id, isCorrect: true }
        });
        return {
          ...user,
          totalAttempts: user._count.progress,
          correctAttempts: correctCount,
          accuracy: user._count.progress > 0
            ? Math.round((correctCount / user._count.progress) * 100)
            : 0
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Single User Progress ──────────────────────────────────
const getUserProgress = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get progress grouped by subject/chapter
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            chapter: {
              include: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: { attemptedAt: 'desc' }
    });

    // Group by subject → chapter
    const subjectMap = {};
    for (const p of progress) {
      const subj = p.question.chapter.subject;
      const chap = p.question.chapter;

      if (!subjectMap[subj.id]) {
        subjectMap[subj.id] = {
          id: subj.id,
          title: subj.title,
          code: subj.code,
          chapters: {}
        };
      }

      if (!subjectMap[subj.id].chapters[chap.id]) {
        subjectMap[subj.id].chapters[chap.id] = {
          id: chap.id,
          title: chap.title,
          chapterNumber: chap.chapterNumber,
          totalAttempts: 0,
          correctAttempts: 0
        };
      }

      subjectMap[subj.id].chapters[chap.id].totalAttempts++;
      if (p.isCorrect) {
        subjectMap[subj.id].chapters[chap.id].correctAttempts++;
      }
    }

    // Convert maps to arrays
    const subjectProgress = Object.values(subjectMap).map(subj => ({
      ...subj,
      chapters: Object.values(subj.chapters)
    }));

    res.json({ user, subjectProgress });
  } catch (error) {
    console.error('getUserProgress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Subjects with Chapters ────────────────────────────────
const getSubjectsWithChapters = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: {
            _count: { select: { questions: true } }
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    res.json(subjects);
  } catch (error) {
    console.error('getSubjectsWithChapters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Create Subject ────────────────────────────────────────
const subjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  colorClass: z.string().optional()
});

const createSubject = async (req, res) => {
  try {
    const parsed = subjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const existing = await prisma.subject.findUnique({ where: { code: parsed.data.code } });
    if (existing) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    const subject = await prisma.subject.create({ data: parsed.data });
    res.status(201).json(subject);
  } catch (error) {
    console.error('createSubject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Create Chapter ────────────────────────────────────────
const chapterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  chapterNumber: z.number().int().positive('Chapter number must be positive')
});

const createChapter = async (req, res) => {
  try {
    const subjectId = parseInt(req.params.subjectId);

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const parsed = chapterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const chapter = await prisma.chapter.create({
      data: { ...parsed.data, subjectId }
    });

    res.status(201).json(chapter);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Chapter number already exists for this subject' });
    }
    console.error('createChapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Bulk Upload Questions ─────────────────────────────────
const questionSchema = z.object({
  questionText: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.string().length(1).refine(v => ['A', 'B', 'C', 'D'].includes(v.toUpperCase()), {
    message: 'correctOption must be A, B, C, or D'
  })
});

const bulkUploadQuestions = async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId);

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    });
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'questions must be a non-empty array' });
    }

    // Validate all questions first
    const errors = [];
    const validQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const parsed = questionSchema.safeParse(questions[i]);
      if (!parsed.success) {
        errors.push({ index: i, errors: parsed.error.errors.map(e => e.message) });
      } else {
        validQuestions.push({
          ...parsed.data,
          correctOption: parsed.data.correctOption.toUpperCase(),
          chapterId
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Validation failed for ${errors.length} question(s)`,
        errors
      });
    }

    // Bulk insert
    const result = await prisma.question.createMany({
      data: validQuestions
    });

    res.status(201).json({
      message: `Successfully uploaded ${result.count} questions to "${chapter.subject.title} — ${chapter.title}"`,
      count: result.count
    });
  } catch (error) {
    console.error('bulkUploadQuestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Delete Subject ────────────────────────────────────────
const deleteSubject = async (req, res) => {
  try {
    const subjectId = parseInt(req.params.subjectId);
    
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    await prisma.subject.delete({ where: { id: subjectId } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('deleteSubject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Contact Messages ────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markMessageRead = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (status !== 'READ' && status !== 'UNREAD') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status }
    });
    res.json(message);
  } catch (error) {
    console.error('markMessageRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    await prisma.contactMessage.delete({ where: { id: messageId } });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
  deleteMessage
};
