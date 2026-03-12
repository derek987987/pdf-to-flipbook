# Quickstart: PDF to Flipbook MVP

## Prerequisites
- **Python**: 3.11+
- **Node.js**: 20.x+
- **Poppler**: Required for conversion.
  - macOS: `brew install poppler`
  - Linux: `sudo apt-get install poppler-utils`

## Backend Setup
1. Navigate to `backend/`.
2. Create virtual env: `python -m venv venv`.
3. Activate: `source venv/bin/activate`.
4. Install dependencies: `pip install fastapi uvicorn pdf2image pydantic sqlalchemy`.
5. Run server: `uvicorn main:app --reload`.

## Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Install flipbook engine: `npm install page-flip`.
4. Run app: `npm run dev`.

## Validation Steps
1. Open browser to `http://localhost:5173`.
2. Select a PDF file < 500MB.
3. Observe upload and conversion progress.
4. Interact with the flipbook (flip pages, navigate).
5. Verify 24h accessibility in an Incognito window.
