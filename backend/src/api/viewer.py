import os
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.document import Document, FlipbookPage

router = APIRouter()

@router.get("/viewer/{id}")
async def get_viewer_metadata(id: str, request: Request, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get base URL for page images
    base_url = str(request.base_url).rstrip("/")
    
    pages = db.query(FlipbookPage).filter(FlipbookPage.document_id == id).order_by(FlipbookPage.page_number).all()
    
    page_urls = [f"{base_url}/api/v1/pages/{id}/{p.page_number}" for p in pages]
    
    return {
        "id": doc.id,
        "original_name": doc.original_name,
        "page_count": doc.page_count,
        "pages": page_urls
    }

@router.get("/pages/{id}/{page_num}")
async def get_page_image(id: str, page_num: int, db: Session = Depends(get_db)):
    page = db.query(FlipbookPage).filter(
        FlipbookPage.document_id == id,
        FlipbookPage.page_number == page_num
    ).first()
    
    if not page or not page.image_path:
        raise HTTPException(status_code=404, detail="Page not found")
    
    if not os.path.exists(page.image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
        
    return FileResponse(page.image_path, media_type="image/jpeg")
