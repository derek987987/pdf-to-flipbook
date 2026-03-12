# Implementation Plan: PDF to Flipbook MVP

**Branch**: `001-pdf-flipbook-mvp` | **Date**: 2026-03-12 | **Spec**: specs/001-pdf-flipbook-mvp/spec.md
**Input**: Feature specification from `/specs/001-pdf-flipbook-mvp/spec.md`

## Summary
Implement a web application that converts uploaded PDF files into interactive flipbooks. The system will handle document conversion (PDF to Image), serve an interactive viewer, and manage a 24-hour data retention policy.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript 5.4 (Frontend)  
**Primary Dependencies**: FastAPI, pdf2image (Poppler), React 18, page-flip (NNP)  
**Storage**: Local Filesystem (Assets), SQLite (Metadata & Lifecycle)  
**Testing**: pytest (Backend), Vitest (Frontend)  
**Target Platform**: Modern Web Browsers, Mobile-responsive (Single-page view)  
**Project Type**: web-service  
**Performance Goals**: < 30s conversion for 10MB PDF, 60 FPS animations  
**Constraints**: 500MB/200-page upload limit, 24-hour retention  
**Scale/Scope**: MVP (Anonymous uploads)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GATE 1: Testing & Verification**: Automated tests MUST cover the conversion pipeline and the background cleanup worker.
- **GATE 2: Architecture**: Services MUST be decoupled (e.g., separate `ConversionService` and `CleanupService`).
- **GATE 3: Documentation**: API and Data models documented in `contracts/` and `data-model.md`.
- **GATE 4: Workflow**: Surgical implementation focusing only on MVP requirements.

## Project Structure

```text
backend/
├── src/
│   ├── api/           # FastAPI routers
│   ├── models/        # SQLAlchemy schemas
│   ├── services/      # Upload, Converter, Cleanup logic
│   └── main.py
└── tests/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/    # UploadForm, FlipbookViewer
│   ├── hooks/         # API integration
│   └── App.tsx
└── tests/
```

**Structure Decision**: Option 2: Web application (frontend + backend).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
