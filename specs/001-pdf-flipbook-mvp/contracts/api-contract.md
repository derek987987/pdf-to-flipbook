# API Contract: PDF to Flipbook MVP

## Endpoints

### POST /api/v1/upload
Uploads a PDF file.
- **Request**: `multipart/form-data`
  - `file`: PDF file (Max 50MB/200 pages)
- **Response**: `201 Created`
  - Body: `{"id": "UUID", "status": "PENDING"}`
- **Errors**:
  - `400 Bad Request`: Invalid file or limits exceeded.

### GET /api/v1/status/{id}
Polls for conversion status.
- **Request**: Path param `id`
- **Response**: `200 OK`
  - Body: `{"id": "UUID", "status": "PENDING|PROCESSING|COMPLETED|ERROR", "error": "string|null"}`

### GET /api/v1/viewer/{id}
Retrieves viewer metadata.
- **Request**: Path param `id`
- **Response**: `200 OK`
  - Body:
    ```json
    {
      "id": "UUID",
      "original_name": "report.pdf",
      "page_count": 10,
      "pages": [
        "http://domain/api/v1/pages/UUID/1",
        "http://domain/api/v1/pages/UUID/2"
      ]
    }
    ```

### GET /api/v1/pages/{id}/{page_num}
Serves rendered page image.
- **Request**: Path params `id`, `page_num`
- **Response**: `200 OK`
  - Content-Type: `image/jpeg`
