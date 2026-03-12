import os
import shutil
import datetime
from sqlalchemy.orm import Session
from ..models.document import Document
from ..database import SessionLocal

def cleanup_expired_documents():
    db = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        expired_docs = db.query(Document).filter(Document.expires_at < now).all()
        
        for doc in expired_docs:
            # Delete PDF file
            if doc.pdf_path and os.path.exists(doc.pdf_path):
                try:
                    os.remove(doc.pdf_path)
                except Exception as e:
                    print(f"Error deleting PDF file {doc.pdf_path}: {e}")

            # Delete converted images directory
            # Assuming images are stored in a directory named after the doc id
            doc_dir = os.path.join("converted", doc.id)
            if os.path.exists(doc_dir):
                try:
                    shutil.rmtree(doc_dir)
                except Exception as e:
                    print(f"Error deleting directory {doc_dir}: {e}")

            # Delete database record (cascades to pages)
            db.delete(doc)
        
        db.commit()
    except Exception as e:
        print(f"Cleanup error: {e}")
        db.rollback()
    finally:
        db.close()
