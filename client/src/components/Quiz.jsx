import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, HelpCircle, CheckCircle, XCircle,
  Loader, Trophy, RotateCcw, BookOpen, Target, Layers
} from 'lucide-react';
import './Quiz.css';

const API_BASE = 'http://localhost:5000/api/subjects';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const Quiz = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [activeChapter, setActiveChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctOption }
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Fetch subject details
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(`${API_BASE}/${subjectId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load subject');
        const data = await res.json();
        setSubject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  // Start a chapter quiz
  const startChapter = async (chapterId) => {
    setQuizLoading(true);
    setQuizComplete(false);
    setScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/chapters/${chapterId}/questions`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      setActiveChapter(data.chapter);
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit answer
  const handleSelectOption = async (option) => {
    if (answered) return;
    setSelectedOption(option);
    setAnswered(true);

    try {
      const res = await fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          selectedOption: option
        })
      });
      const data = await res.json();
      setFeedback(data);
      if (data.isCorrect) setScore(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Next question
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setAnswered(false);
    setFeedback(null);
  };

  // Go back to chapter list
  const backToChapters = () => {
    setActiveChapter(null);
    setQuestions([]);
    setQuizComplete(false);
    setCurrentIndex(0);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <Loader size={32} className="spinner-icon" />
          <p>Loading subject...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="quiz-container">
        <button className="back-btn" onClick={() => navigate('/subjects')}>
          <ArrowLeft size={18} /> Back to Subjects
        </button>
        <div className="quiz-loading">
          <p>Subject not found.</p>
        </div>
      </div>
    );
  }

  // ─── Results Screen ────────────────────────────
  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const resultLevel = percentage >= 80 ? 'great' : percentage >= 50 ? 'good' : 'improve';

    return (
      <div className="quiz-container">
        <div className="quiz-wrapper">
          <div className="results-card">
            <div className={`results-icon ${resultLevel}`}>
              <Trophy size={36} />
            </div>
            <h2>
              {resultLevel === 'great' ? 'Excellent!' : resultLevel === 'good' ? 'Good Job!' : 'Keep Practicing!'}
            </h2>
            <p className="results-subtitle">
              {activeChapter.title} — {subject.title}
            </p>

            <div className="results-score-ring" style={{
              background: `conic-gradient(${resultLevel === 'great' ? '#22c55e' : resultLevel === 'good' ? '#3b82f6' : '#f59e0b'} ${percentage * 3.6}deg, #f1f5f9 0deg)`
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="percentage">{percentage}%</span>
              </div>
            </div>

            <div className="results-stats">
              <div className="results-stat">
                <div className="value" style={{ color: '#22c55e' }}>{score}</div>
                <div className="label">Correct</div>
              </div>
              <div className="results-stat">
                <div className="value" style={{ color: '#ef4444' }}>{questions.length - score}</div>
                <div className="label">Wrong</div>
              </div>
              <div className="results-stat">
                <div className="value">{questions.length}</div>
                <div className="label">Total</div>
              </div>
            </div>

            <div className="results-actions">
              <button className="results-btn primary" onClick={() => startChapter(activeChapter.id)}>
                <RotateCcw size={18} /> Retry Chapter
              </button>
              <button className="results-btn secondary" onClick={backToChapters}>
                <BookOpen size={18} /> All Chapters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active Quiz ───────────────────────────────
  if (activeChapter && questions.length > 0) {
    const q = questions[currentIndex];
    const options = [
      { letter: 'A', text: q.optionA },
      { letter: 'B', text: q.optionB },
      { letter: 'C', text: q.optionC },
      { letter: 'D', text: q.optionD }
    ];

    return (
      <div className="quiz-container">
        <button className="back-btn" onClick={backToChapters}>
          <ArrowLeft size={18} /> Back to Chapters
        </button>

        <div className="quiz-wrapper">
          <div className="quiz-progress">
            <div className="quiz-progress-info">
              <span className="current-q">Question {currentIndex + 1} of {questions.length}</span>
              <span>Score: {score}/{currentIndex + (answered ? 1 : 0)}</span>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="question-card">
            <div className="question-number">
              {activeChapter.title} — {subject.title}
            </div>
            <div className="question-text">{q.questionText}</div>

            <div className="options-list">
              {options.map(opt => {
                let className = 'option-btn';
                if (answered && feedback) {
                  if (opt.letter === feedback.correctOption) className += ' correct';
                  else if (opt.letter === selectedOption && !feedback.isCorrect) className += ' wrong';
                } else if (opt.letter === selectedOption) {
                  className += ' selected';
                }

                return (
                  <button
                    key={opt.letter}
                    className={className}
                    onClick={() => handleSelectOption(opt.letter)}
                    disabled={answered}
                  >
                    <span className="option-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="quiz-actions">
              {answered && feedback && (
                <div className={`feedback-text ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                  {feedback.isCorrect ? (
                    <><CheckCircle size={18} /> Correct!</>
                  ) : (
                    <><XCircle size={18} /> Wrong — Answer is {feedback.correctOption}</>
                  )}
                </div>
              )}
              {answered && (
                <button className="next-btn" onClick={handleNext}>
                  {currentIndex + 1 >= questions.length ? 'View Results' : 'Next'}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chapter List (default) ────────────────────
  return (
    <div className="quiz-container">
      <button className="back-btn" onClick={() => navigate('/subjects')}>
        <ArrowLeft size={18} /> Back to Subjects
      </button>

      <div className="quiz-subject-header">
        <span className="subject-code">{subject.code}</span>
        <h1>{subject.title}</h1>
        <p>{subject.totalChapters} Chapters • {subject.totalQuestions} MCQs</p>
      </div>

      {quizLoading ? (
        <div className="quiz-loading">
          <Loader size={32} className="spinner-icon" />
          <p>Loading questions...</p>
        </div>
      ) : (
        <div className="chapters-grid">
          {subject.chapters.map(ch => (
            <div
              key={ch.id}
              className={`chapter-card ${ch.questionCount === 0 ? 'disabled' : ''}`}
              onClick={() => ch.questionCount > 0 && startChapter(ch.id)}
            >
              <div className="chapter-number">Chapter {ch.chapterNumber}</div>
              <h3>{ch.title}</h3>
              <div className="chapter-meta">
                <HelpCircle size={16} />
                <span>{ch.questionCount} Questions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quiz;
