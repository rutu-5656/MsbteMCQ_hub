const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/tests/generate
// Body: { chapterId: Int, numQuestions: Int }
exports.generateTest = async (req, res) => {
  try {
    const { chapterId, numQuestions } = req.body;
    const userId = req.user.id;

    if (!chapterId || !numQuestions) {
      return res.status(400).json({ message: 'Chapter ID and number of questions are required' });
    }

    // 1. Fetch eligible questions for the chapter
    const questions = await prisma.question.findMany({
      where: { chapterId: Number(chapterId) },
      select: {
        id: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        // intentionally omitting correctOption so it doesn't go to frontend
      }
    });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this chapter' });
    }

    // 2. Randomly select requested number of questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(numQuestions, questions.length));

    // 3. Create TestAttempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId,
        chapterId: Number(chapterId),
        totalQs: selectedQuestions.length,
        status: 'IN_PROGRESS'
      }
    });

    // 4. Create empty TestAnswers
    const testAnswersData = selectedQuestions.map(q => ({
      testAttemptId: attempt.id,
      questionId: q.id
    }));

    await prisma.testAnswer.createMany({
      data: testAnswersData
    });

    res.status(201).json({
      attemptId: attempt.id,
      questions: selectedQuestions
    });

  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({ message: 'Failed to generate test' });
  }
};

// POST /api/tests/:attemptId/submit
// Body: { answers: [{ questionId, selectedOption, timeSpent }] }
exports.submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // array from frontend
    const userId = req.user.id;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: Number(attemptId) }
    });

    if (!attempt) return res.status(404).json({ message: 'Test attempt not found' });
    if (attempt.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });
    if (attempt.status === 'COMPLETED') return res.status(400).json({ message: 'Test already completed' });

    // Fetch the correct options for the questions in this attempt
    const testAnswers = await prisma.testAnswer.findMany({
      where: { testAttemptId: attempt.id },
      include: { question: true }
    });

    let score = 0;
    let totalTime = 0;

    // Evaluate answers
    for (const ta of testAnswers) {
      // Find the corresponding answer from the frontend array
      const submittedAns = answers.find(a => a.questionId === ta.questionId);
      
      let isCorrect = false;
      let isSkipped = true;
      let selectedOption = null;
      let timeSpent = 0;

      if (submittedAns) {
        selectedOption = submittedAns.selectedOption;
        timeSpent = submittedAns.timeSpent || 0;
        
        if (selectedOption) {
          isSkipped = false;
          isCorrect = selectedOption === ta.question.correctOption;
          if (isCorrect) score++;
        }
      }
      
      totalTime += timeSpent;

      // Update the TestAnswer record
      await prisma.testAnswer.update({
        where: { id: ta.id },
        data: {
          selectedOption,
          isCorrect,
          isSkipped,
          timeSpent
        }
      });
    }

    // Update TestAttempt
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        timeSpent: totalTime,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    res.json({
      message: 'Test submitted successfully',
      attempt: updatedAttempt
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Failed to submit test' });
  }
};

// GET /api/tests/:attemptId
exports.getTestResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: Number(attemptId) },
      include: {
        chapter: {
          include: { subject: true }
        },
        answers: {
          include: {
            question: true // this includes the correctOption for frontend review
          }
        }
      }
    });

    if (!attempt) return res.status(404).json({ message: 'Test attempt not found' });
    if (attempt.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    res.json(attempt);

  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ message: 'Failed to fetch test result' });
  }
};
