# PDF to Flipbook MVP

A web application that converts PDF files into interactive flipbooks.

## Features
- **PDF Upload**: Upload PDF files up to 500MB and 200 pages.
- **Interactive Reading**: Realistic 3D page-turn animations.
- **Navigation Controls**: First, Last, Prev, Next, Zoom, and Thumbnails.
- **Anonymous Viewing**: No account required.
- **Auto-Expiry**: Converted flipbooks are automatically deleted after 24 hours.

## Technology Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, SQLite, pdf2image (Poppler).
- **Frontend**: TypeScript, React, page-flip library.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Poppler (system dependency)
  - macOS: `brew install poppler`
  - Linux: `sudo apt-get install poppler-utils`

### Backend Setup
1. `cd backend`
2. `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `uvicorn src.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Testing
Run all tests:
```bash
export PYTHONPATH=.
python3 -m pytest
```
