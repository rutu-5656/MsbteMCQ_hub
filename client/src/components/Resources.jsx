import React, { useState, useEffect } from 'react';
import { FileText, Download, Folder, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import './Resources.css';

const API_BASE = 'http://localhost:5000/api';
const SERVER_URL = 'http://localhost:5000';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${API_BASE}/resources`);
        if (!res.ok) throw new Error('Failed to load resources');
        const data = await res.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    const cat = resource.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(resource);
    return acc;
  }, {});

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>Study Resources</h1>
        <p>Download previous year question papers, syllabuses, and quick revision notes.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader size={32} className="spinner-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p>Loading resources...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : Object.keys(groupedResources).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Folder size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No Resources Available</h3>
          <p>Check back later or ask an admin to upload some materials.</p>
        </div>
      ) : (
        <div className="resources-content">
          {Object.entries(groupedResources).map(([category, items]) => {
            const isExpanded = expandedCategories[category];
            
            return (
              <div className={`resource-category ${isExpanded ? 'expanded' : ''}`} key={category}>
                <div 
                  className="category-title" 
                  onClick={() => toggleCategory(category)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Folder size={24} className="folder-icon" />
                    <h2 style={{ margin: 0 }}>{category}</h2>
                    <span className="resource-count">{items.length} file{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="dropdown-icon">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="resource-list dropdown-animation">
                    {items.map(item => (
                      <div className="resource-item" key={item.id}>
                        <div className="resource-info">
                          <div className={`icon-box ${item.fileType.toLowerCase()}`}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4>{item.title}</h4>
                            <p>{item.fileType} • {item.fileSize} • Added {formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        <a 
                          href={`${SERVER_URL}${item.filePath}`} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="download-btn"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Download size={18} /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Resources;
