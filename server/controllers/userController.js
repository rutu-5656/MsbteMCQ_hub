const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch User Data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Fetch all completed test attempts for stats
    const testAttempts = await prisma.testAttempt.findMany({
      where: { 
        userId: userId,
        status: 'COMPLETED'
      }
    });

    // 3. Calculate Stats
    const totalTests = testAttempts.length;
    let totalScore = 0;
    let totalQuestionsAnswered = 0;
    let timeSpentLearning = 0; // in seconds

    testAttempts.forEach(attempt => {
      totalScore += attempt.score;
      totalQuestionsAnswered += attempt.totalQs;
      timeSpentLearning += attempt.timeSpent;
    });

    const averageAccuracy = totalQuestionsAnswered > 0 
      ? Math.round((totalScore / totalQuestionsAnswered) * 100) 
      : 0;

    // 4. Fetch Recent Activity (top 3 recent tests)
    const recentActivityRaw = await prisma.testAttempt.findMany({
      where: { userId: userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 3,
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });

    const recentActivity = recentActivityRaw.map(test => ({
      id: test.id,
      subjectTitle: test.chapter.subject.title,
      score: test.score,
      totalQs: test.totalQs,
      completedAt: test.completedAt
    }));

    // 5. Fetch Recommended Subjects
    // For now, fetch 2 random or latest subjects
    const recommendedSubjects = await prisma.subject.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chapters: true }
        }
      }
    });

    const formattedRecommended = recommendedSubjects.map(sub => ({
      id: sub.id,
      title: sub.title,
      icon: '💻', // We can add an icon field to DB later or map based on category
      questionsCount: sub._count.chapters * 10 // Mock count based on chapters
    }));

    res.json({
      userName: user.name || user.email.split('@')[0],
      stats: {
        totalTests,
        averageAccuracy,
        questionsAnswered: totalQuestionsAnswered,
        timeSpentLearning
      },
      recentActivity,
      recommended: formattedRecommended
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
