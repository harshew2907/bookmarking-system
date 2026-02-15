const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. Middleware ---
app.use(cors({
  origin: ['https://markit-frontend.onrender.com', 'http://localhost:5173'], // Added localhost so it works for testing too!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- 2. In-Memory Store (Seed Data) ---
let bookmarks = [
  { id: "1", title: "GitHub", url: "https://github.com", description: "Where world builds software", tags: ["dev", "git"], createdAt: new Date().toISOString() },
  { id: "2", title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Web docs for devs", tags: ["dev", "docs"], createdAt: new Date().toISOString() },
  { id: "3", title: "Vite", url: "https://vitejs.dev", description: "Next gen frontend tooling", tags: ["tooling", "frontend"], createdAt: new Date().toISOString() },
  { id: "4", title: "Tailwind CSS", url: "https://tailwindcss.com", description: "Utility-first CSS framework", tags: ["css", "design"], createdAt: new Date().toISOString() },
  { id: "5", title: "Excalidraw", url: "https://excalidraw.com", description: "Virtual whiteboard", tags: ["design", "tools"], createdAt: new Date().toISOString() }
];

// --- 3. API Routes ---

/** GET /bookmarks - Fetch all or filter by tag */
app.get('/bookmarks', (req, res) => {
  const { tag } = req.query;
  if (tag) {
    const filtered = bookmarks.filter(b => b.tags.includes(tag.toLowerCase()));
    return res.json(filtered);
  }
  res.json(bookmarks);
});

/** POST /bookmarks - Create with auto-metadata fetching */
app.post('/bookmarks', async (req, res) => {
  let { url, title, description, tags } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  // Ensure URL has http/https prefix
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  if (!title) {
    try {
      const response = await axios.get(url, { 
        timeout: 3000, 
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      });
      const $ = cheerio.load(response.data);
      title = $('title').text().trim() || url; // Fallback to URL if title tag is empty
    } catch (error) {
      // If scraping fails, DON'T crash, just use a fallback
      title = url; 
    }
  }

  const newBookmark = {
    id: uuidv4(),
    url,
    title: title.substring(0, 200),
    description: (description || "").substring(0, 500),
    tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase()).slice(0, 5) : [],
    createdAt: new Date().toISOString()
  };

  bookmarks.push(newBookmark);
  res.status(201).json(newBookmark);
});

/** PUT /bookmarks/:id - Update existing */
app.put('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const index = bookmarks.findIndex(b => b.id === id);

  if (index === -1) return res.status(404).json({ error: "Bookmark not found" });

  // Merge existing data with updates, keep the original ID
  bookmarks[index] = { ...bookmarks[index], ...req.body, id };
  res.json(bookmarks[index]);
});

/** DELETE /bookmarks/:id - Remove bookmark */
app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = bookmarks.length;
  bookmarks = bookmarks.filter(b => b.id !== id);
  
  if (bookmarks.length === initialLength) {
    return res.status(404).json({ error: "Bookmark not found" });
  }
  res.status(204).send();
});

// --- 4. Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Backend Server running at http://localhost:${PORT}`);
});