# AI Resume Analyzer & Interview Preparation Platform

A production-ready, modern full-stack web application designed to help candidates optimize their resumes for Applicant Tracking Systems (ATS) and prepare for career placement screens using an interactive AI-powered mock interviewer chatbot.

Built with the **MERN** stack (MongoDB, Express, React, Node) and integrated with **Google Gemini AI**.

---

## 🚀 Key Features

*   **Secure Authentication & User Profiles:** Complete Sign Up, Sign In, Profile adjustments, and secure avatar uploads. Default admin roles lock system controls.
*   **Resume Parsing & Extraction:** Direct drag-and-drop PDF upload parses resume texts using `pdf-parse`, auto-extracting contact, education, experiences, projects, and skills.
*   **AI Resume critique:** Provides a detailed 9-point critique of resume strengths, weaknesses, actionable suggestions, formatting advice, and grammar recommendations.
*   **Predictive ATS Scorecard:** Generates overall (0-100) match rates and dimension breakdowns, highlights missing keywords, and renders an interactive improvement checklist.
*   **Skill Gap roadmaps:** Audits user skills against required industry benchmarks for positions like *Full Stack Developer*, *Data Analyst*, and *Software Engineer* to produce phased learning pathways.
*   **Interactive Conversational Chatbot interviewer:** Conducts stateful mock interviews question-by-question, incorporating speech synthesis (read aloud) and voice recognition (speech-to-text), returning dynamic scoring cards and final placement transcripts.
*   **Platform Admin Control Suite:** Metric widget grids, database user deletions, audit activity logs, and system prompt parameters tweaking interfaces.
*   **Responsive Dark/Light mode:** High-fidelity SaaS styling built with Tailwind CSS, animated gauges, glassmorphic grids, loading skeletons, and interactive Recharts.

---

## 📁 Project Structure

```text
resume_analyzer/
├── backend/
│   ├── config/             # DB and client configuration (db.js)
│   ├── controllers/        # Express route business logic controllers
│   ├── middleware/         # Security layers, rate limiters, file uploads (Multer)
│   ├── models/             # Mongoose schemas (User, Resume, ATSReport, Interviews...)
│   ├── routes/             # Express API routing mappings
│   ├── utils/              # PDF converters and Google Gemini AI hooks
│   ├── uploads/            # Secure storage directory for resumes & profile avatars
│   ├── package.json        # Backend scripts and dependencies
│   ├── server.js           # Server startup script
│   └── .env                # Port, Database URI, and API keys
└── frontend/
    ├── public/             # Static page assets
    ├── src/
    │   ├── components/     # Common layouts, sidebars, navbars, progress rings
    │   ├── context/        # Auth state and light/dark theme providers
    │   ├── pages/          # Application views (Dashboard, Interview, ATS...)
    │   ├── services/       # Axios wrappers and API clients
    │   ├── App.jsx         # Routes mappings and guards
    │   ├── index.css       # Tailwind CSS directives
    │   └── main.jsx        # Bootstrap entry script
    ├── package.json        # Frontend scripts and configurations
    ├── vite.config.js      # Vite build configurations with backend proxies
    └── tailwind.config.js  # Dark mode, themes, and font configurations
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) installed locally.

### 1. Database Setup
*   Ensure your local MongoDB database service is running on `mongodb://127.0.0.1:27017`.

### 2. Backend Configuration
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Open the `.env` file and configure your Google Gemini API Key:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/resume_analyzer
    JWT_SECRET=super_secret_jwt_token_for_resume_analyzer_app_2026
    GEMINI_API_KEY=your_gemini_api_key_here
    MOCK_AI=false
    ```
    *Note: If no API key is supplied, you can keep `MOCK_AI=true` to let the system generate high-quality fallback AI outputs for testing purposes.*
4.  Start the Express API server:
    ```bash
    npm run dev
    ```

### 3. Frontend Configuration
1.  Open a new terminal session and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the local dashboard client at:
    `http://localhost:3000`

---

## 🔑 Pre-seeded Testing Accounts

Upon starting, the backend automatically seeds two secure demonstration accounts to permit quick inspection:

*   **Administrator Account:**
    *   **Email:** `admin@platform.com`
    *   **Password:** `AdminPass123!`
*   **Candidate Account:**
    *   **Email:** `user@platform.com`
    *   **Password:** `UserPass123!`
