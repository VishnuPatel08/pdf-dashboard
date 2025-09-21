# PDF Viewer + Data Extraction Dashboard
## Objective

A monorepo project to build a PDF Review Dashboard where users can:

- Upload and view PDFs in-browser.

- Run AI extraction using Gemini API or Groq.

- Edit extracted data, perform CRUD operations, and store data in MongoDB.

- Maintain separation of frontend (apps/web) and backend (apps/api).

- Follow best practices (linting, error handling, structured code).

## Tech Stack

- Monorepo: Turborepo or npm workspaces

- Frontend (apps/web): Next.js (App Router) + TypeScript + shadcn/ui

- Backend (apps/api): Node.js (TypeScript, REST API)

- Database: MongoDB Atlas

- AI Integration: Gemini API or Groq

- PDF Viewer: pdf.js

- Deployment: Vercel (frontend)
              backend (Render)

## Core Features

### PDF Viewer

- Upload local PDF (≤25 MB).

- Render with zoom + page navigation.

- Store in Vercel Blob or MongoDB GridFS.

### AI Data Extraction

- “Extract with AI” → choose Gemini or Groq.

- Extract invoice fields:

- Vendor (name, address, taxId)

- Invoice (number, date, currency, subtotal, taxPercent, total, poNumber, poDate)

- Line items (description, unitPrice, quantity, total)

### Data Editing & CRUD

- Edit extracted fields in UI.

- Create/Read/Update/Delete invoice records in MongoDB.

- List view with search (vendor.name, invoice.number).

### API (apps/api)

- POST /upload → accepts PDF → { fileId, fileName }

- POST /extract → { fileId, model: "gemini" | "groq" } → extracted JSON

- GET /invoices (+ ?q= search)

- GET /invoices/:id

- PUT /invoices/:id

- DELETE /invoices/:id

- Validations + consistent responses.

### UI (apps/web)

- Split layout: Left = PDF Viewer, Right = Editable Form.

- Buttons: Extract, Save, Delete.

- Built with shadcn/ui components (inputs, table, dialogs, toasts).

## Repository Structure
```sh
.
├── apps
│   ├── web   # Next.js frontend
│   └── api   # Node.js backend
├── packages  # (optional shared types/utils)
└── README.md
```

# Setup Local Machine
1. Clone Repo
```sh
git clone <repo-url>
cd <repo>
```
2. Install Dependencies
```sh
npm install
```
3. Environment Variables
- Create .env in apps/api with:
```sh
MONGODB_URI=<your_mongodb_uri>
GEMINI_API_KEY=<your_gemini_api_key>
GROQ_API_KEY=<your_groq_api_key>
PORT=3001
```
- Create .env in apps/web with:
```sh
NEXT_PUBLIC_API_URL=http://localhost:3001
```
4. Build app
```sh
npm run build
```
5. Start app
```sh
npm run dev
```

## Deployment

- Frontend (Web): https://pdf-dashboardsss.vercel.app/

- Backend (API): https://pdf-dashboard-b4j7.onrender.com/




