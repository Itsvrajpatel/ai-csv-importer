# 🚀 AI CSV Importer

<div align="center">
  <p>An AI-powered CSV Importer that intelligently maps uploaded file columns to CRM fields using Google's Gemini AI. Users can upload CSV files, preview AI-generated mappings, validate data, and import structured CRM-ready records with minimal manual effort.</p>
</div>

## 🌐 Demo

- **Live Frontend URL:** `https://ai-csv-importer-chi.vercel.app/`
- **Backend API URL:** `https://ai-csv-importer-t33w.onrender.com`

## 📸 Screenshots

<img width="1897" height="908" alt="image" src="https://github.com/user-attachments/assets/024afacb-f3df-4f73-82a5-26bca699f3a4" />
<img width="1897" height="907" alt="image" src="https://github.com/user-attachments/assets/15dfbcf5-db37-4575-b4ff-d56ba8605437" />
<img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/72fb7a50-0cac-424e-bc31-1fe11245ca35" />
<img width="1896" height="906" alt="image" src="https://github.com/user-attachments/assets/3aaaf1cc-8bc5-4b77-85e2-51b12926a855" />


## ✨ Features

- **AI-Powered Mapping:** Intelligent column mapping using Google's Gemini AI.
- **Multiple File Formats:** Seamlessly parse and validate CSV file uploads.
- **Automatic Header Detection:** Automatically identifies and extracts headers from uploaded files.
- **Data Preview:** Review AI-generated mappings and validate data before proceeding with the import.
- **Confidence Scores:** View AI mapping confidence scores to ensure accuracy.
- **Drag & Drop Interface:** Modern and intuitive drag-and-drop file upload experience.
- **Robust Validation:** Strict data validation using Zod schemas.
- **Error Handling:** Comprehensive error handling for both file parsing and API interactions.
- **Modern UI:** Responsive and visually appealing user interface built with modern standards.
- **Production-Ready:** Scalable architecture with separate frontend and backend deployments.

## 🛠️ Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![TanStack](https://img.shields.io/badge/TanStack_Table-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![PapaParse](https://img.shields.io/badge/PapaParse-5B3A29?style=for-the-badge)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![PapaParse](https://img.shields.io/badge/PapaParse-5B3A29?style=for-the-badge)
![Multer](https://img.shields.io/badge/Multer-FF7B00?style=for-the-badge)

### Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

## 📖 API Documentation

### Import CSV
**Endpoint:** `POST /api/import`  
**Content-Type:** `multipart/form-data`

Uploads a CSV file, parses it, and maps it using Gemini AI.

**Query Parameters:**
- `batchSize` (optional): Number of rows to process per Gemini request (default: `10`).

**Form Data:**
- `file`: The CSV file to upload.

**Success Response (200 OK):**
```json
{
  "success": true,
  "totalRows": 25,
  "imported": 24,
  "skipped": 1,
  "failedBatches": 0,
  "successfulBatches": 3,
  "processingTime": 1250,
  "records": [ ... ],
  "warnings": [ "Row 5 skipped because missing required field" ],
  "skippedRows": [ ... ]
}
```

## 🏗️ Architecture Flow

The application follows a clean, decoupled architecture:

```mermaid
graph TD
    A[User] -->|Uploads CSV File| B(Next.js Frontend)
    B -->|Sends Data| C{Express Backend}
    C -->|Requests Mapping| D[Gemini AI]
    D -->|Returns Mapped Fields| C
    C -->|Sends Response| B
    B -->|Previews Data| A
    A -->|Confirms Import| B
    B -->|Finalizes Import| C
    C -->|Saves Structured Data| E[(CRM / Database)]
```

1. **User** interacts with the modern UI to upload a file.
2. **Next.js Frontend** parses the file and sends the extracted headers/sample data to the backend.
3. **Express Backend** receives the request and communicates with the **Gemini AI API**.
4. **Gemini AI** intelligently maps the uploaded columns to the target CRM schema.
5. The **Backend** returns the mapped data alongside confidence scores to the frontend.
6. The **User** previews, adjusts if necessary, and confirms the import.

## 📂 Folder Structure

```text
ai-csv-importer/
├── app/                  # Next.js App Router
├── components/           # React components (Upload, Table, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Helper functions and validations
├── services/             # Frontend API services
├── types/                # TypeScript definitions
├── backend/              # Node.js / Express application
│   ├── src/
│   │   ├── config/       # Environment & configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middlewares (Upload, Error, Logger)
│   │   ├── prompts/      # Gemini AI prompt builders
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic & Gemini AI integration
│   │   ├── utils/        # Utilities (Logger)
│   │   └── validators/   # Zod validation schemas
│   ├── package.json
│   └── ...
├── package.json          # Frontend dependencies
├── README.md
└── .gitignore

```

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js** (v20 or higher)
- **npm** (or yarn/pnpm)
- **Git**
- **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

## 🚀 Complete Local Setup Guide

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone <repo-url>
cd ai-csv-importer
```

### 2. Backend Setup

Open a new terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory and add your environment variables:

```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

Start the backend development server:

```bash
npm run dev
```
*(The backend should now be running on `http://localhost:8000`)*

### 3. Frontend Setup

Open another new terminal and navigate to the root directory:

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the `root` directory:

```env
BACKEND_URL=http://localhost:8000
```

Start the frontend development server:

```bash
npm run dev
```
*(The frontend should now be running on `http://localhost:3000`)*

### 4. Usage

1. Open `http://localhost:3000` in your browser.
2. Drag and drop a CSV file.
3. Review the AI-generated mappings.
4. Finalize the import!

## 🐛 Troubleshooting

- **Upload Fails Immediately:** Ensure your file is strictly a `.csv` file and under the 5MB size limit.
- **Frontend API 404/500 Errors:** Make sure your backend is running, and that `BACKEND_URL` in your frontend `.env.local` accurately points to the running backend port.
- **Gemini Extraction Fails:** Ensure `GEMINI_API_KEY` is valid and hasn't exceeded its quota. Check backend console logs for specific API errors.


---
<div align="center">
  <i>Built with ❤️ by Vraj Patel.</i>
</div>
