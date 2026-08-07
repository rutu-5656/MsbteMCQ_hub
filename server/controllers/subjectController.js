const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public: Get all subjects with chapter count and question count
const getSubjects = async (req, res) => {
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

    const result = subjects.map(s => ({
      id: s.id,
      title: s.title,
      code: s.code,
      colorClass: s.colorClass,
      totalChapters: s.chapters.length,
      totalQuestions: s.chapters.reduce((sum, ch) => sum + (ch._count?.questions || 0), 0),
      chapters: s.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        questionCount: ch._count?.questions || 0
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('getSubjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single subject with chapters
const getSubjectById = async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: {
            _count: { select: { questions: true } }
          }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      id: subject.id,
      title: subject.title,
      code: subject.code,
      colorClass: subject.colorClass,
      totalChapters: subject.chapters.length,
      totalQuestions: subject.chapters.reduce((sum, ch) => sum + (ch._count?.questions || 0), 0),
      chapters: subject.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        questionCount: ch._count?.questions || 0
      }))
    });
  } catch (error) {
    console.error('getSubjectById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get questions for a chapter (shuffled)
const getChapterQuestions = async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId);

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: { select: { id: true, title: true, code: true } },
        questions: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctOption: true
          }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Shuffle questions
    const shuffled = [...chapter.questions].sort(() => Math.random() - 0.5);

    res.json({
      chapter: {
        id: chapter.id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber
      },
      subject: chapter.subject,
      totalQuestions: shuffled.length,
      questions: shuffled
    });
  } catch (error) {
    console.error('getChapterQuestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit an answer and track progress
const submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;
    const userId = req.user.id;

    if (!questionId || !selectedOption) {
      return res.status(400).json({ message: 'questionId and selectedOption are required' });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctOption.toUpperCase() === selectedOption.toUpperCase();

    await prisma.userProgress.create({
      data: {
        userId,
        questionId,
        isCorrect
      }
    });

    res.json({
      isCorrect,
      correctOption: question.correctOption
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSubjects, getSubjectById, getChapterQuestions, submitAnswer };
