import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Upload, Shield, BarChart3, BookOpen,
  HelpCircle, Target, Search, ChevronDown, ChevronUp, FileJson,
  X, CheckCircle, AlertCircle, Plus, FolderPlus, UserCheck, FileText
} from 'lucide-react';
import './AdminPanel.css';

const API_BASE = 'http://localhost:5000/api/admin';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// ═══════════════════════════════════════════════════
//  ADMIN PANEL — Main Component
// ═══════════════════════════════════════════════════
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'upload', label: 'Upload MCQs', icon: <Upload size={18} /> },
    { id: 'resources', label: 'Resources', icon: <FileText size={18} /> }
  ];

  return (
    <div className="admin-container">
      <div className="admin-inner">
        <div className="admin-header">
          <div className="admin-header-top">
            <div className="admin-badge"><Shield size={14} /> Admin Panel</div>
          </div>
          <h1>Command Center</h1>
          <p>Monitor users, track progress, and manage your question bank.</p>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab showToast={showToast} />}
        {activeTab === 'users' && <UsersTab showToast={showToast} />}
        {activeTab === 'upload' && <UploadTab showToast={showToast} />}
        {activeTab === 'resources' && <ResourcesTab showToast={showToast} />}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  OVERVIEW TAB
// ═══════════════════════════════════════════════════
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;
  if (!stats) return <div className="empty-state"><h4>Could not load stats</h4></div>;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><Users size={24} /></div>
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><HelpCircle size={24} /></div>
          <h3>Total Questions</h3>
          <div className="stat-value">{stats.totalQuestions}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Target size={24} /></div>
          <h3>Total Attempts</h3>
          <div className="stat-value">{stats.totalAttempts}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><BarChart3 size={24} /></div>
          <h3>Accuracy</h3>
          <div className="stat-value">{stats.accuracy}%</div>
        </div>
      </div>

      <div className="section-title">
        Recent Signups
        <span className="count-badge">{stats.recentUsers?.length || 0}</span>
      </div>

      <div className="recent-users-list">
        {stats.recentUsers?.map(user => (
          <div className="recent-user-item" key={user.id}>
            <div className="recent-user-avatar">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="recent-user-info">
              <div className="name">{user.name || user.email}</div>
              <div className="date">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  USERS TAB
// ═══════════════════════════════════════════════════
const UsersTab = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => { setLoading(false); showToast('error', 'Failed to load users'); });
  }, []);

  const toggleUserDetail = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserProgress(null);
      return;
    }

    setExpandedUser(userId);
    setProgressLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/${userId}/progress`, { headers: getAuthHeaders() });
      const data = await res.json();
      setUserProgress(data);
    } catch {
      showToast('error', 'Failed to load user progress');
    } finally {
      setProgressLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q));
  });

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-title">
        All Users
        <span className="count-badge">{users.length}</span>
      </div>

      <div className="users-search">
        <Search size={18} color="#475569" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Attempts</th>
              <th>Accuracy</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <React.Fragment key={user.id}>
                <tr>
                  <td className="user-email">{user.name || user.email}</td>
                  <td>
                    <span className={`user-role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td>{user.totalAttempts}</td>
                  <td>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${user.accuracy}%` }} />
                      </div>
                      <span className="progress-text">{user.accuracy}%</span>
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="view-btn" onClick={() => toggleUserDetail(user.id)}>
                      {expandedUser === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedUser === user.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedUser === user.id && (
                  <tr className="user-detail-row">
                    <td colSpan={6}>
                      <div className="user-detail-content">
                        {progressLoading ? (
                          <div className="loading-wrapper"><div className="spinner" /></div>
                        ) : userProgress?.subjectProgress?.length > 0 ? (
                          <div className="user-detail-grid">
                            {userProgress.subjectProgress.map(subj => (
                              <div className="user-detail-card" key={subj.id}>
                                <h4>{subj.title} ({subj.code})</h4>
                                {subj.chapters.map(ch => (
                                  <div className="chapter-progress-item" key={ch.id}>
                                    <span>Ch {ch.chapterNumber}: {ch.title}</span>
                                    <span>{ch.correctAttempts}/{ch.totalAttempts}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>No progress data yet for this user.</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <h4>No users found</h4>
                    <p>Try a different search term.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  UPLOAD TAB
// ═══════════════════════════════════════════════════
const UploadTab = ({ showToast }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Create subject/chapter states
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterNumber, setNewChapterNumber] = useState('');
  const [creating, setCreating] = useState(false);

  const loadSubjects = () => {
    fetch(`${API_BASE}/subjects`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => showToast('error', 'Failed to load subjects'));
  };

  useEffect(() => { loadSubjects(); }, []);

  // Transform a question from alternative format to our API format
  const normalizeQuestion = (q) => {
    // If already in correct format, return as-is
    if (q.questionText && q.optionA) return q;

    // Transform from alternative format (e.g., { question, options: {A,B,C,D}, correct_option })
    return {
      questionText: q.questionText || q.question || q.text || '',
      optionA: q.optionA || (q.options && q.options.A) || '',
      optionB: q.optionB || (q.options && q.options.B) || '',
      optionC: q.optionC || (q.options && q.options.C) || '',
      optionD: q.optionD || (q.options && q.options.D) || '',
      correctOption: q.correctOption || q.correct_option || q.answer || ''
    };
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.json')) {
      showToast('error', 'Please select a JSON file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);

        // Support wrapped format: { "questions": [...] }
        if (!Array.isArray(data) && data.questions && Array.isArray(data.questions)) {
          data = data.questions;
        }

        if (!Array.isArray(data)) {
          showToast('error', 'JSON must be an array of questions or an object with a "questions" array');
          setFile(null);
          return;
        }

        // Normalize all questions to our API format
        const normalized = data.map(normalizeQuestion);
        setPreview(normalized);
        showToast('success', `Loaded ${normalized.length} questions`);
      } catch {
        showToast('error', 'Invalid JSON file');
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedChapter || preview.length === 0) {
      showToast('error', 'Select a chapter and upload a file first');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/chapters/${selectedChapter}/questions/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questions: preview })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
        setFile(null);
        setPreview([]);
        loadSubjects();
      } else {
        showToast('error', data.message || 'Upload failed');
      }
    } catch {
      showToast('error', 'Upload failed. Check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectTitle.trim() || !newSubjectCode.trim()) {
      showToast('error', 'Title and code are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newSubjectTitle, code: newSubjectCode })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Subject "${data.title}" created`);
        setNewSubjectTitle('');
        setNewSubjectCode('');
        loadSubjects();
      } else {
        showToast('error', data.message);
      }
    } catch {
      showToast('error', 'Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChapter = async () => {
    if (!selectedSubject || !newChapterTitle.trim() || !newChapterNumber) {
      showToast('error', 'Select a subject, enter title and chapter number');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/subjects/${selectedSubject}/chapters`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newChapterTitle,
          chapterNumber: parseInt(newChapterNumber)
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', `Chapter "${data.title}" created`);
        setNewChapterTitle('');
        setNewChapterNumber('');
        loadSubjects();
      } else {
        showToast('error', data.message);
      }
    } catch {
      showToast('error', 'Failed to create chapter');
    } finally {
      setCreating(false);
    }
  };

  const selectedSubjectData = subjects.find(s => s.id === parseInt(selectedSubject));

  return (
    <div>
      <div className="upload-layout">
        {/* Left — Subject/Chapter Management */}
        <div className="upload-panel">
          <h3><FolderPlus size={20} /> Manage Subjects & Chapters</h3>

          {/* Create Subject */}
          <div className="form-group">
            <label>Create New Subject</label>
            <div className="form-row">
              <div className="form-group">
                <input
                  className="form-input"
                  placeholder="Subject title (e.g., ETI)"
                  value={newSubjectTitle}
                  onChange={e => setNewSubjectTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  className="form-input"
                  placeholder="Code (e.g., 316303)"
                  value={newSubjectCode}
                  onChange={e => setNewSubjectCode(e.target.value)}
                />
              </div>
            </div>
            <button className="submit-btn" onClick={handleCreateSubject} disabled={creating}>
              <Plus size={16} /> Add Subject
            </button>
          </div>

          {/* Create Chapter */}
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label>Add Chapter to Subject</label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.code})</option>
              ))}
            </select>
          </div>

          {selectedSubject && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <input
                    className="form-input"
                    placeholder="Chapter title"
                    value={newChapterTitle}
                    onChange={e => setNewChapterTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Ch. No."
                    min="1"
                    value={newChapterNumber}
                    onChange={e => setNewChapterNumber(e.target.value)}
                  />
                </div>
              </div>
              <button className="submit-btn" onClick={handleCreateChapter} disabled={creating}>
                <Plus size={16} /> Add Chapter
              </button>
            </>
          )}

          {/* Existing subjects/chapters overview */}
          {subjects.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div className="section-title" style={{ fontSize: '1rem' }}>
                Existing Subjects
                <span className="count-badge">{subjects.length}</span>
              </div>
              <div className="subjects-list">
                {subjects.map(s => (
                  <div className="subject-item" key={s.id}>
                    <div className="subject-item-header">
                      <span className="subject-item-title">{s.title}</span>
                      <span className="subject-item-code">{s.code}</span>
                    </div>
                    <div className="chapter-count">
                      {s.chapters.length} chapter{s.chapters.length !== 1 ? 's' : ''}
                      {s.chapters.length > 0 && (
                        <> — {s.chapters.reduce((sum, ch) => sum + (ch._count?.questions || 0), 0)} questions</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — File Upload */}
        <div className="upload-panel">
          <h3><Upload size={20} /> Bulk Upload Questions</h3>

          {/* Select Subject & Chapter for upload */}
          <div className="form-group">
            <label>Select Subject</label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }}
            >
              <option value="">Select Subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.code})</option>
              ))}
            </select>
          </div>

          {selectedSubjectData && (
            <div className="form-group">
              <label>Select Chapter</label>
              <select
                className="form-select"
                value={selectedChapter}
                onChange={e => setSelectedChapter(e.target.value)}
              >
                <option value="">Select Chapter...</option>
                {selectedSubjectData.chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Ch {ch.chapterNumber}: {ch.title} ({ch._count?.questions || 0} questions)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dropzone */}
          {!file ? (
            <div
              className={`dropzone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <div className="dropzone-icon"><FileJson size={28} /></div>
              <h4>Drop your JSON file here</h4>
              <p>or <span className="highlight">browse</span> to select a file</p>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="file-selected">
              <FileJson size={24} color="#60a5fa" />
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{preview.length} questions • {(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button className="file-remove" onClick={() => { setFile(null); setPreview([]); }}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="preview-wrapper" style={{ marginBottom: '1.5rem' }}>
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>A</th>
                    <th>B</th>
                    <th>C</th>
                    <th>D</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((q, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{q.questionText}</td>
                      <td>{q.optionA}</td>
                      <td>{q.optionB}</td>
                      <td>{q.optionC}</td>
                      <td>{q.optionD}</td>
                      <td><span className="correct-badge">{q.correctOption}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <div style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
                  ... and {preview.length - 20} more questions
                </div>
              )}
            </div>
          )}

          {/* Upload button */}
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading || !selectedChapter || preview.length === 0}
          >
            {uploading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Uploading...
              </>
            ) : (
              <>
                <UserCheck size={18} />
                Upload {preview.length > 0 ? `${preview.length} Questions` : 'Questions'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

// ═══════════════════════════════════════════════════
//  RESOURCES TAB
// ═══════════════════════════════════════════════════
const ResourcesTab = ({ showToast }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !category || !file) {
      showToast('error', 'Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      showToast('success', 'Resource uploaded successfully!');
      setTitle('');
      setCategory('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tab-pane">
      <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Upload Study Resource</h3>
        <p className="subtitle">Upload PDFs, Docs, or Images for students to download.</p>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <div className="form-group">
            <label>Resource Title</label>
            <input
              type="text"
              placeholder="e.g. Basic Science Formula Sheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
            />
          </div>
          
          <div className="form-group">
            <label>Category / Branch</label>
            <input
              type="text"
              placeholder="e.g. FYCO - First Year Computer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-input"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="FYCO - First Year Computer" />
              <option value="FYME - First Year Mechanical" />
              <option value="SYCO - Second Year Computer" />
            </datalist>
          </div>
          
          <div className="form-group">
            <label>File to Upload</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="admin-input"
              ref={fileRef}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </div>
          
          <button type="submit" className="admin-btn primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </div>
    </div>
  );
};
