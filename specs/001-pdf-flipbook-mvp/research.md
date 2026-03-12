# Research: PDF to Flipbook MVP

## Decision: PDF Conversion Library
- **Decision**: `pdf2image` (using Poppler).
- **Rationale**: Poppler is highly mature and renders PDFs accurately. Converting pages to 150-200 DPI JPEG/PNG images is the most reliable way to serve content to a web-based viewer.
- **Alternatives Considered**: `PyMuPDF` (faster but AGPL license), `PDF.js` (client-side rendering, might be heavy for low-end devices).

## Decision: Flipbook Engine
- **Decision**: `page-flip` (by NNP).
- **Rationale**: Lightweight, dependency-free (React wrapper available), and provides realistic 3D animations for page turns.
- **Alternatives Considered**: `Turn.js` (requires jQuery), CSS-only solutions (too complex for interactive page corners).

## Decision: Ephemeral Storage (24h)
- **Decision**: FastAPI Background Tasks + SQLite.
- **Rationale**: Simple to implement for an MVP. A background task runs every hour to query SQLite for expired documents and delete associated files from the filesystem.
- **Alternatives Considered**: Cron jobs (requires host-level setup), Redis with TTL (adds infrastructure complexity).
