import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5001/bookmarks';

function App() {
  // Move this INSIDE the function
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [formData, setFormData] = useState({ title: '', url: '', description: '', tags: '' });
  const [editingId, setEditingId] = useState(null);

  const showMessage = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
  };

  const fetchBookmarks = async () => {
    try {
      const url = activeTag ? `${API_URL}?tag=${activeTag}` : API_URL;
      const res = await axios.get(url);
      setBookmarks(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchBookmarks(); }, [activeTag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) return showMessage("URL is required", "error");

    const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, { ...formData, tags: tagArray });
        showMessage("Bookmark updated!");
        setEditingId(null);
      } else {
        await axios.post(API_URL, { ...formData, tags: tagArray });
        showMessage("New bookmark added!");
      }
      setFormData({ title: '', url: '', description: '', tags: '' });
      fetchBookmarks();
    } catch (err) {
      // Dynamic error message logic
      const msg = err.response?.data?.error || "Server connection failed. Is the backend running?";
      showMessage(msg, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showMessage("Bookmark deleted", "error");
        fetchBookmarks();
      } catch (err) {
        showMessage("Could not delete bookmark", "error");
      }
    }
  };

  const handleEdit = (bookmark) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(bookmark.id);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      tags: bookmark.tags.join(', ')
    });
  };

  const filteredItems = bookmarks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className="container">
    {/* HEADER SECTION */}
    <header>
      <h1>🔖 MarkIt</h1>
      <p>Your personal curated corner of the web.</p>
    </header>

    {/* STATUS NOTIFICATIONS */}
    {statusMsg.text && (
      <div className={`status-banner ${statusMsg.type || 'success'}`}>
        <span>{statusMsg.type === 'error' ? '⚠️' : '✨'}</span>
        {statusMsg.text}
      </div>
    )}

    {/* ADD/EDIT FORM CARD */}
    <section className="glass-card">
      <h3>{editingId ? "🚀 Edit Bookmark" : "✨ Add New Bookmark"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* Row 1: Title and URL */}
          <input 
            type="text"
            placeholder="Title (Optional - Auto-fetched if empty)" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
          <input 
            type="url"
            placeholder="URL (https://...)" 
            value={formData.url} 
            onChange={e => setFormData({...formData, url: e.target.value})} 
            required
          />
          
          {/* Row 2: Description spans full width */}
          <textarea 
            placeholder="Write a brief description about this link..." 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          
          {/* Row 3: Tags and Submit Button */}
          <input 
            type="text"
            placeholder="Tags (dev, design, tools...)" 
            value={formData.tags} 
            onChange={e => setFormData({...formData, tags: e.target.value})} 
          />
          
          <div className="flex" style={{ gap: '10px' }}>
            <button className="btn-primary" type="submit" style={{ flex: 2 }}>
              {editingId ? "Update Link" : "Save Bookmark"}
            </button>
            {editingId && (
              <button 
                className="clear-filter-btn" 
                type="button" 
                onClick={() => {
                  setEditingId(null); 
                  setFormData({title: '', url: '', description: '', tags: ''});
                }}
                style={{ flex: 1, margin: 0 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </section>

    {/* SEARCH & FILTER BAR */}
    <div className="search-filter-row">
      <input 
        className="search-input"
        placeholder="🔍 Search titles, descriptions, or URLs..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
      />
      {activeTag && (
        <button className="clear-filter-btn" onClick={() => setActiveTag('')}>
          Showing: #{activeTag} ✕
        </button>
      )}
    </div>

    {/* BOOKMARK LIST GRID */}
    <div className="bookmark-grid">
      {filteredItems.length > 0 ? (
        filteredItems.map(b => (
          <div key={b.id} className="glass-card">
            <h4>{b.title}</h4>
            <a href={b.url} target="_blank" rel="noreferrer">
              {b.url.replace(/^https?:\/\//, '')}
            </a>
            <p>{b.description || "No description provided."}</p>
            
            {/* TAG PILLS */}
            <div>
              {b.tags && b.tags.map(t => (
                <span key={t} className="tag" onClick={() => setActiveTag(t)}>
                  #{t}
                </span>
              ))}
            </div>
            
            <hr />
            
            {/* ACTION BUTTONS */}
            <div>
              <button onClick={() => handleEdit(b)}>✍️ Edit</button>
              <button onClick={() => handleDelete(b.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No bookmarks found matching your search. 📂</p>
        </div>
      )}
    </div>
  </div>
);
}

export default App;