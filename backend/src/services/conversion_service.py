import os
import uuid
import pdf2image
from sqlalchemy.orm import sessionmaker
from ..models.document import Document, DocumentStatus, FlipbookPage

def process_pdf_conversion(document_id: str, SessionLocal: sessionmaker):
    db = SessionLocal()
    try:
        # Get document
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            print(f"Document {document_id} not found")
            return

        # Update status
        doc.status = DocumentStatus.PROCESSING
        db.commit()

        # Create output directory
        output_dir = os.path.join("converted", document_id)
        os.makedirs(output_dir, exist_ok=True)

        # Convert PDF to Images
        # Target resolution 150 DPI per FR-002
        images = pdf2image.convert_from_path(doc.pdf_path, dpi=200)
        
        doc.page_count = len(images)
        
        for i, image in enumerate(images):
            page_num = i + 1
            image_filename = f"page_{page_num}.jpg"
            image_path = os.path.join(output_dir, image_filename)
            
            image.save(image_path, "JPEG")
            
            # Create page record
            page = FlipbookPage(
                id=str(uuid.uuid4()),
                document_id=document_id,
                page_number=page_num,
                image_path=image_path
            )
            db.add(page)

        # Finalize
        doc.status = DocumentStatus.COMPLETED
        db.commit()
        
    except Exception as e:
        print(f"Conversion error for {document_id}: {e}")
        doc.status = DocumentStatus.ERROR
        doc.error_message = str(e)
        db.commit()
    finally:
        db.close()
