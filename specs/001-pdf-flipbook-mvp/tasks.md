# Tasks: PDF to Flipbook MVP

**Input**: Design documents from `/specs/001-pdf-flipbook-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are MANDATORY for all features and bug fixes as per the Project Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure in backend/src/
- [X] T002 Create frontend directory structure in frontend/src/
- [X] T003 [P] Initialize Python project with dependencies in backend/requirements.txt
- [X] T004 [P] Initialize React project with dependencies in frontend/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Setup SQLite database schema and SQLAlchemy models in backend/src/models/document.py
- [X] T006 Implement base FastAPI application and global error handling in backend/src/main.py
- [X] T007 Implement 24h background cleanup service in backend/src/services/cleanup_service.py
- [X] T008 [P] Add unit tests for 24h cleanup logic in backend/tests/unit/test_cleanup.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - PDF Upload & Automatic Conversion (Priority: P1) 🎯 MVP

**Goal**: User can upload a PDF and have it automatically converted to a web-readable image format.

**Independent Test**: Upload a valid PDF (< 50MB, < 200 pages), verify the status changes to COMPLETED, and check that images are generated in the filesystem.

### Tests for User Story 1 (MANDATORY)

- [X] T009 [P] [US1] Create unit test for PDF validation (size/pages) in backend/tests/unit/test_upload_validation.py
- [X] T010 [P] [US1] Create integration test for the full conversion pipeline in backend/tests/integration/test_conversion.py

### Implementation for User Story 1

- [X] T011 [US1] Implement upload validation logic (50MB/200 pages) in backend/src/services/upload_service.py
- [X] T012 [US1] Implement PDF to Image conversion service using pdf2image in backend/src/services/conversion_service.py
- [X] T013 [US1] Implement POST /api/v1/upload endpoint in backend/src/api/upload.py
- [X] T014 [US1] Implement GET /api/v1/status/{id} polling endpoint in backend/src/api/status.py
- [X] T015 [US1] Create frontend UploadForm component in frontend/src/components/UploadForm.tsx
- [X] T016 [US1] Implement upload logic and status polling hook in frontend/src/hooks/useUpload.ts

**Checkpoint**: User Story 1 is functional - PDF can be uploaded and converted.

---

## Phase 4: User Story 2 - Interactive Flipbook Reading (Priority: P1)

**Goal**: User can interact with the converted PDF as an animated flipbook.

**Independent Test**: Access the unique flipbook URL and verify that clicking/dragging page corners triggers a realistic turn animation.

### Tests for User Story 2 (MANDATORY)

- [X] T017 [P] [US2] Create integration test for viewer metadata and image serving endpoints in backend/tests/integration/test_viewer_api.py

### Implementation for User Story 2

- [X] T018 [US2] Implement GET /api/v1/viewer/{id} and GET /api/v1/pages/{id}/{page_num} in backend/src/api/viewer.py
- [X] T019 [US2] Integrate page-flip library into frontend/src/components/FlipbookViewer.tsx
- [X] T020 [US2] Implement mobile-responsive single-page view logic in frontend/src/components/FlipbookViewer.tsx

**Checkpoint**: User Story 2 is functional - User can read the flipbook with animations.

---

## Phase 5: User Story 3 - Flipbook Navigation Controls (Priority: P2)

**Goal**: User has basic controls for navigating the flipbook (First, Last, Zoom, Thumbnails).

**Independent Test**: Use the navigation buttons and zoom controls in the viewer to jump between pages and increase legibility.

### Implementation for User Story 3

- [X] T021 [US3] Add Next, Previous, First, and Last navigation buttons to frontend/src/components/FlipbookViewer.tsx
- [X] T022 [US3] Implement page zoom functionality in frontend/src/components/FlipbookViewer.tsx
- [X] T023 [US3] Add visual thumbnail strip for quick navigation in frontend/src/components/ThumbnailsStrip.tsx

**Checkpoint**: All user stories are functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [X] T024 [P] Create final E2E test covering the full upload-to-read journey in tests/e2e/test_full_flow.py
- [X] T025 [P] Finalize project documentation and quickstart instructions in README.md
- [X] T026 Perform final code cleanup and ensure all tests pass in CI

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 3 (needs converted images).
- **Phase 5 (US3)**: Depends on Phase 4 (needs viewer).
- **Phase 6 (Polish)**: Depends on all user stories.

### Parallel Opportunities

- T003 and T004 can start together.
- T008 can be written while T005-T007 are implemented.
- T009 and T010 can be written while Phase 2 completes.
- Within US1, frontend (T015-T016) and backend (T011-T014) can proceed in parallel once the contract is settled.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup & Foundational phases.
2. Complete US1 (Upload & Conversion).
3. **STOP and VALIDATE**: Verify conversion quality and status polling.

### Incremental Delivery

1. Add US2 (Reading experience) once US1 is stable.
2. Add US3 (Navigation controls) as a polish layer.
3. Each story is verified with mandatory tests before moving to the next.
