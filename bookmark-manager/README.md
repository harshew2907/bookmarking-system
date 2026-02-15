# 🔖 MarkIt - Smart Bookmark Manager

A full-stack application built for the Figmenta practical test. This tool allows users to save, search, and categorize web links with a modern, high-performance UI.

## ✨ Features
- **Auto-Metadata Fetching**: Leave the title blank, and the backend will automatically scrape the website's title using Cheerio.
- **Elite UI**: Responsive glassmorphism design with animated backgrounds.
- **Real-Time Search**: Filter through your bookmarks by title, URL, or description instantly.
- **Tagging System**: Organize links with tags and filter the view by clicking on them.
- **Full CRUD**: Create, Read, Update, and Delete operations fully integrated with a Node.js backend.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Axios, CSS3 (Custom Elite Styling)
- **Backend**: Node.js, Express, Cheerio, Axios
- **Database**: In-memory data store (resets on server restart)

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js** installed.

### 2. Install Dependencies
From the root folder, run:
```bash
cd backend && npm install
cd ../frontend && npm install
