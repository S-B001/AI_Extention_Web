# Scrape AI – AI-powered Content Scraper Project

**Scrape AI** is a comprehensive content scraping and knowledge management project, consisting of two separate components:

1. **Web Platform – Scrape AI**  
2. **Chrome Extension – Content Scraper**  

Both are connected via a shared backend (Supabase + Node.js) to allow seamless storage, retrieval, and AI-powered interaction with scraped content.

---

## Features

### Web Platform – Scrape AI
- Dashboard to view scraped articles.
- Saved articles with bookmarking & delete functionality.
- AI-assisted chat to ask questions about articles.
- Search functionality across all saved content.
- Responsive and modern UI/UX.

### Chrome Extension – Content Scraper
- Scrape content directly from any webpage.
- Save scraped content to the backend with a User ID.
- View scraped content directly in the extension popup.
- Download scraped content as text, CSV, or JSON.
- Works independently, but integrates with the web platform.

---

## Tech Stack

| Layer                | Technology |
|----------------------|------------|
| Web Frontend         | React, Tailwind CSS, Lucide Icons |
| Chrome Extension     | React, Tailwind CSS, Chrome Scripting API |
| Backend              | Node.js, Express, Supabase, Axios |
| Database             | Supabase (PostgreSQL) |
| AI / Q&A             | Groq API (Llama 3.1) |
| Build Tools          | Vite, ESBuild |
| Authentication       | User ID based login (custom auth) |

---

## Project Structure

### Web Platform – Scrape AI
````backend/
├── node_modules/
├── .env
├── package-lock.json
├── package.json
└── server.js

frontend/
├── node_modules/
├── public/
│ ├── sb-icon.png
│ └── vite.svg
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── Card.jsx
│ │ ├── ChatModal.jsx
│ │ ├── Sidebar.jsx
│ │ ├── Topbar.jsx
| ├── pages/
│ │ ├── Dashboard.jsx
│ │ ├── Login.jsx
│ │ └── Saved.jsx
│ ├── App.css
│ ├── App.jsx
│ ├── index.css
│ ├── main.jsx
│ └── supabaseClient.js
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js

1. **Clone repo**
   ```bash
   git clone <repo_url>
   cd ai-extention

1. **Install dependencies**
cd backend && npm install
cd ../frontend && npm install

## Configure Environment

### Backend (`backend/.env`)
```env
PORT=8080
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
GROQ_API_URL=<Your actual api endpoint>
GROQ_API_KEY=<your-groq-api-key>


## Frontend (`backend/.env`)
```env
VITE_SUPABASE_URL=<project supabase url>
VITE_SUPABASE_ANON_KEY=<Supabse ANON key>
VITE_BACKEND_URL=<Your backend key>

## Run backend
cd backend
node server.js

## Run Frontend
cd frontend
npm run dev

## Approach & Architecture

Frontend (Web + Extension):
Built with React + Tailwind CSS.
Web platform provides dashboard, saved articles, and AI-powered chat.
Chrome extension scrapes webpage content and pushes it to the backend.

Backend:
Node.js + Express server connects to Supabase (PostgreSQL) for data storage.
API endpoints handle CRUD operations for articles, bookmarks, and users.

AI Layer:
Integrated Groq API (Llama 3.1) for conversational Q&A on scraped articles.

Authentication:
Lightweight custom auth using userId stored in localStorage.
Each user’s scraped and saved data remains isolated.