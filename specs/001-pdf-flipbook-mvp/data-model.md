# Data Model: PDF to Flipbook

## Entities

### Document
- `id`: UUID (Primary Key)
- `original_name`: String (e.g., "report.pdf")
- `pdf_path`: String (Local path to original)
- `status`: Enum (PENDING, PROCESSING, COMPLETED, ERROR)
- `page_count`: Integer
- `uploaded_at`: DateTime (ISO 8601)
- `expires_at`: DateTime (24 hours after upload)

### FlipbookPage
- `id`: UUID
- `document_id`: UUID (Foreign Key to Document)
- `page_number`: Integer (1-indexed)
- `image_path`: String (Local path to rendered JPEG)

## State Transitions
1. **PENDING**: File received, database record created.
2. **PROCESSING**: Conversion worker picked up the job.
3. **COMPLETED**: All pages rendered as JPEGs.
4. **ERROR**: Conversion failed (e.g., corrupted PDF).

## Cleanup Policy
A background task runs every 60 minutes, querying for `expires_at < NOW()`. It deletes associated files from the filesystem and removes the database records.
