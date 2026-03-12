import os
import uuid
import datetime
import pdf2image
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db, SessionLocal
from ..models.document import Document, DocumentStatus
from ..services.upload_service import validate_pdf
from ..services.conversion_service import process_pdf_conversion

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", status_code=201)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    doc_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    
    # Save file temporarily to check page count and size
    try:
        content = await file.read()
        with open(pdf_path, "wb") as f:
            f.write(content)
            
        # Mocking a file object for validation as it needs .size
        class FileProxy:
            def __init__(self, size):
                self.size = size
        
        file_size = len(content)
        
        # Get page count
        try:
            info = pdf2image.pdfinfo_from_path(pdf_path)
            page_count = info["Pages"]
        except Exception as e:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            raise HTTPException(status_code=400, detail=f"Invalid PDF file: {e}")

        # Validate
        try:
            validate_pdf(FileProxy(file_size), page_count)
        except ValueError as e:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
            raise HTTPException(status_code=400, detail=str(e))

        # Create document record
        db_doc = Document(
            id=doc_id,
            original_name=file.filename,
            pdf_path=pdf_path,
            status=DocumentStatus.PENDING,
            page_count=page_count,
            uploaded_at=datetime.datetime.utcnow(),
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        # Trigger conversion
        background_tasks.add_task(process_pdf_conversion, doc_id, SessionLocal)

        return {"id": doc_id, "status": db_doc.status}

    except Exception as e:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=str(e))
