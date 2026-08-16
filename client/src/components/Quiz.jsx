import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, HelpCircle, CheckCircle, XCircle,
  Loader, Trophy, RotateCcw, BookOpen, Target, Clock, Flag, LayoutGrid, Check
} from 'lucide-react';
import './Quiz.css';

const API_SUBJECTS = 'https://msbtemcq-hub.onrender.com/api/subjects';
const API_TESTS = 'https://msbtemcq-hub.onrender.com/api/tests';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const Quiz = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // Global State
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('chapterList'); // chapterList, setup, active, submitting, results

  // Test State
  const [activeChapter, setActiveChapter] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOption, isMarkedForReview } }
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const [resultsData, setResultsData] = useState(null);
  const [jumpToQ, setJumpToQ] = useState('');

  // Fetch subject details
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(`${API_SUBJECTS}/${subjectId}`, { headers: getAuthHeaders() });
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

  // Timer Effect
  useEffect(() => {
    let interval;
    if (mode === 'active') {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Setup Phase
  const handleChapterSelect = (chapter) => {
    setActiveChapter(chapter);
    setNumQuestions(Math.min(10, chapter.questionCount)); // default
    setMode('setup');
  };

  const startTest = async () => {
    setMode('submitting'); // show loader
    try {
      const res = await fetch(`${API_TESTS}/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          chapterId: activeChapter.id,
          numQuestions: Number(numQuestions)
        })
      });
      if (!res.ok) throw new Error('Failed to generate test');
      const data = await res.json();
      
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      
      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach(q => {
        initialAnswers[q.id] = { selectedOption: null, isMarkedForReview: false };
      });
      setAnswers(initialAnswers);
      setCurrentIndex(0);
      setTimeSpent(0);
      setMode('active');
    } catch (err) {
      console.error(err);
      setMode('setup');
      alert('Failed to start test. Please try again.');
    }
  };

  // 2. Active Test Interactions
  const handleOptionSelect = (option) => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option }
    }));
  };

  const toggleReview = () => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], isMarkedForReview: !prev[qId].isMarkedForReview }
    }));
  };

  // 3. Submission & Navigation
  const handleJumpToQuestion = (e) => {
    e.preventDefault();
    const qNum = parseInt(jumpToQ, 10);
    if (!isNaN(qNum) && qNum >= 1 && qNum <= questions.length) {
      setCurrentIndex(qNum - 1);
      setJumpToQ('');
    }
  };

  const submitTest = async () => {
    if (!window.confirm("Are you sure you want to submit your test?")) return;
    
    setMode('submitting');
    
    // Format payload
    const submissionPayload = questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id].selectedOption,
      timeSpent: 0 // currently global time is tracked, setting 0 per question for now
    }));

    // In a real advanced app, we'd distribute timeSpent proportionally or track per question
    submissionPayload[0].timeSpent = timeSpent; 

    try {
      const res = await fetch(`${API_TESTS}/${attemptId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers: submissionPayload })
      });
      
      if (!res.ok) throw new Error('Failed to submit test');
      
      // Fetch full results to show analytics
      const resultRes = await fetch(`${API_TESTS}/${attemptId}`, { headers: getAuthHeaders() });
      const resultData = await resultRes.json();
      
      setResultsData(resultData);
      setMode('results');
    } catch (err) {
      console.error(err);
      alert('Failed to submit test.');
      setMode('active');
    }
  };

  const resetToChapters = () => {
    setActiveChapter(null);
    setMode('chapterList');
    setResultsData(null);
  };

  // ─── RENDERERS ────────────────────────────

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

  if (!subject) return <div className="quiz-container">Subject not found.</div>;

  // Render: Setup Mode
  if (mode === 'setup') {
    return (
      <div className="quiz-container">
        <button className="back-btn" onClick={() => setMode('chapterList')}>
          <ArrowLeft size={18} /> Back to Chapters
        </button>
        <div className="setup-card">
          <div className="setup-icon"><Target size={40} /></div>
          <h2>Test Setup</h2>
          <p>Chapter {activeChapter.chapterNumber}: <strong>{activeChapter.title}</strong></p>
          
          <div className="setup-form">
            <label>How many questions?</label>
            <input 
              type="number" 
              min="1" 
              max={activeChapter.questionCount}
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
            <small>Max available: {activeChapter.questionCount}</small>
          </div>
          
          <button className="premium-btn" onClick={startTest}>Start Test</button>
        </div>
      </div>
    );
  }

  // Render: Submitting Mode
  if (mode === 'submitting') {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <Loader size={32} className="spinner-icon" />
          <p>Processing your test...</p>
        </div>
      </div>
    );
  }

  // Render: Active Test Mode
  if (mode === 'active' && questions.length > 0) {
    const q = questions[currentIndex];
    const currentAnswer = answers[q.id];
    
    const options = [
      { letter: 'A', text: q.optionA },
      { letter: 'B', text: q.optionB },
      { letter: 'C', text: q.optionC },
      { letter: 'D', text: q.optionD }
    ];

    const answeredCount = Object.values(answers).filter(a => a.selectedOption).length;

    return (
      <div className="quiz-container active-test-layout">
        
        {/* Left Sidebar Navigator */}
        <div className="test-sidebar">
          <div className="test-stats">
            <div className="timer"><Clock size={16}/> {formatTime(timeSpent)}</div>
            <div className="progress-text">{answeredCount} of {questions.length} Answered</div>
          </div>
          
          <div className="desktop-grid question-grid">
            {questions.map((question, idx) => {
              const ans = answers[question.id];
              let btnClass = 'grid-btn';
              if (idx === currentIndex) btnClass += ' current';
              else if (ans.isMarkedForReview) btnClass += ' review';
              else if (ans.selectedOption) btnClass += ' answered';
              
              return (
                <button 
                  key={question.id} 
                  className={btnClass}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <form className="mobile-jump-form" onSubmit={handleJumpToQuestion}>
            <span className="jump-label">Jump to Question:</span>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 5" 
              value={jumpToQ}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setJumpToQ(val);
              }}
              className="jump-input"
            />
            <button type="submit" className="jump-btn">Go</button>
          </form>

          <button className="submit-test-btn" onClick={submitTest}>
            <Check size={18} /> Submit Test
          </button>
        </div>

        {/* Main Question Panel */}
        <div className="test-main">
          <div className="question-header">
            <h3>Question {currentIndex + 1}</h3>
            <button 
              className={`review-btn ${currentAnswer.isMarkedForReview ? 'active' : ''}`}
              onClick={toggleReview}
            >
              <Flag size={16} /> Mark for Review
            </button>
          </div>
          
          <div className="question-text">{q.questionText}</div>
          
          <div className="options-list">
            {options.map(opt => (
              <button
                key={opt.letter}
                className={`option-btn ${currentAnswer.selectedOption === opt.letter ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(opt.letter)}
              >
                <span className="option-letter">{opt.letter}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>

          <div className="test-navigation">
            <button 
              className="nav-btn outline" 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            
            {currentIndex === questions.length - 1 ? (
              <button className="nav-btn primary" onClick={submitTest}>
                Submit Test
              </button>
            ) : (
              <button 
                className="nav-btn primary"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>

      </div>
    );
  }

  // Render: Results Mode
  if (mode === 'results' && resultsData) {
    const percentage = Math.round((resultsData.score / resultsData.totalQs) * 100);
    const resultLevel = percentage >= 80 ? 'great' : percentage >= 50 ? 'good' : 'improve';
    
    // Calculate stats
    const correct = resultsData.score;
    const skipped = resultsData.answers.filter(a => a.isSkipped).length;
    const wrong = resultsData.totalQs - correct - skipped;

    return (
      <div className="quiz-container">
        <div className="results-wrapper">
          <div className="results-card">
            <div className={`results-icon ${resultLevel}`}>
              <Trophy size={36} />
            </div>
            <h2>{resultLevel === 'great' ? 'Excellent Work!' : resultLevel === 'good' ? 'Good Effort!' : 'Needs Practice!'}</h2>
            <p className="results-subtitle">Chapter: {resultsData.chapter.title}</p>

            <div className="results-score-ring" style={{
              background: `conic-gradient(${resultLevel === 'great' ? '#22c55e' : resultLevel === 'good' ? '#3b82f6' : '#f59e0b'} ${percentage * 3.6}deg, #f1f5f9 0deg)`
            }}>
              <div className="ring-inner">
                <span className="percentage">{percentage}%</span>
                <span className="time-taken">{formatTime(resultsData.timeSpent)}</span>
              </div>
            </div>

            <div className="results-stats">
              <div className="results-stat">
                <div className="value correct-val">{correct}</div>
                <div className="label">Correct</div>
              </div>
              <div className="results-stat">
                <div className="value wrong-val">{wrong}</div>
                <div className="label">Incorrect</div>
              </div>
              <div className="results-stat">
                <div className="value skipped-val">{skipped}</div>
                <div className="label">Skipped</div>
              </div>
            </div>

            <div className="results-actions">
              <a 
                href={`https://api.whatsapp.com/send?text=I just scored ${correct}/${resultsData.totalQs} in ${resultsData.chapter.title} on takeUforward! Think you can beat my score? Try it here: https://takeufroward.vercel.app/`}
                target="_blank" 
                rel="noreferrer"
                className="results-btn"
                style={{ background: '#25D366', color: 'white', borderColor: '#25D366' }}
              >
                Share on WhatsApp
              </a>
              <button className="results-btn secondary" onClick={() => handleChapterSelect(resultsData.chapter)}>
                <RotateCcw size={18} /> Retake Test
              </button>
              <button className="results-btn primary" onClick={resetToChapters}>
                <BookOpen size={18} /> Back to Chapters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render: Default Chapter List Mode
  return (
    <div className="quiz-container">
      <button className="back-btn" onClick={() => navigate('/subjects')}>
        <ArrowLeft size={18} /> Back to Subjects
      </button>

      <div className="quiz-subject-header">
        <span className="subject-code">{subject.code}</span>
        <h1>{subject.title}</h1>
        <p>{subject.chapters.length} Chapters • {subject.chapters.reduce((sum, ch) => sum + ch.questionCount, 0)} Total MCQs</p>
      </div>

      <div className="chapters-grid">
        {subject.chapters.map(ch => (
          <div
            key={ch.id}
            className={`chapter-card ${ch.questionCount === 0 ? 'disabled' : ''}`}
            onClick={() => ch.questionCount > 0 && handleChapterSelect(ch)}
          >
            <div className="chapter-number">Chapter {ch.chapterNumber}</div>
            <h3>{ch.title}</h3>
            <div className="chapter-meta">
              <LayoutGrid size={16} />
              <span>{ch.questionCount} Questions Available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
