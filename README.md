# QueryMind AI – SQL Query Optimizer

## Project Overview
- **Name**: QueryMind AI
- **Goal**: AI-powered SQL query analyzer that detects performance issues, recommends indexes, and generates optimized queries
- **Tech Stack**: React + Vite + Tailwind CSS (frontend) + Node.js + Express (backend)
- **AI Engine**: Rule-based, zero API cost

## Live URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/analyze
- **Health Check**: http://localhost:4000/api/health

## Features Implemented
- ✅ SQL query paste and syntax-highlighted editor
- ✅ Database schema input for deep index analysis
- ✅ .sql file upload with drag-and-drop
- ✅ 10+ SQL issue detectors (SELECT *, missing WHERE, too many JOINs, etc.)
- ✅ Performance score out of 100
- ✅ Risk level: Good / Medium / High Risk / Critical
- ✅ Index recommendationrs with CREATE INDEX statements
- ✅ Optimized query geneation
- ✅ Expected performance impact estimation
- ✅ Downloadable reports (.txt and .json)
- ✅ Sample query loader
- ✅ Responsive mobile-friendly UI
- ✅ Navbar, Hero, Analyzer, Features, Developer, Footer sections

## Issue Detectors
1. SELECT * usage
2. Missing WHERE clause (full table scan)
3. Too many JOINs (5+)
4. JOIN columns without indexes
5. WHERE columns without indexes
6. ORDER BY columns without indexes
7. GROUP BY columns without indexes
8. LIKE '%keyword%' leading wildcards
9. Nested subqueries
10. Missing LIMIT clause

## API Reference
POST /api/analyze
Request: { "query": "...", "schema": "..." }
Response: { score, riskLevel, issues, recommendations, indexes, optimizedQuery, impact, metadata }

POST /api/parse-sql-file (multipart/form-data, file field)
Response: { query, schema, rawContent }

## Project Structure
```
querymind/
├── backend/
│   ├── server.js          # Express API + rule-based AI engine
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Analyzer.jsx         # Main two-column analyzer
│   │   │   ├── AnalysisReport.jsx   # Results with tabs
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── DeveloperSection.jsx
│   │   │   └── Footer.jsx
│   │   └── index.css
│   ├── vite.config.js     # Dev proxy /api → :4000
│   └── tailwind.config.js
├── ecosystem.config.cjs   # PM2 config for both services
└── README.md
```

## Start Commands
```bash
# Start both services
cd /home/user/querymind && pm2 start ecosystem.config.cjs

# Check status
pm2 list

# View logs
pm2 logs --nostream
```
