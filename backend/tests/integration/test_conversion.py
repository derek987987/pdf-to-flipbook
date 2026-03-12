import pytest
import os
import shutil
import uuid
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.src.database import Base
from backend.src.models.document import Document, DocumentStatus, FlipbookPage
from backend.src.services.conversion_service import process_pdf_conversion

# Use a separate test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_conversion.db"
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_process_pdf_conversion_success(db_session, monkeypatch):
    # Setup: Create a PENDING document record
    doc_id = str(uuid.uuid4())
    doc = Document(
        id=doc_id, 
        original_name="test.pdf", 
        pdf_path="uploads/test.pdf", 
        status=DocumentStatus.PENDING,
        uploaded_at=datetime.datetime.utcnow(),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=1)
    )
    db_session.add(doc)
    db_session.commit()

    # Create dummy uploads dir
    os.makedirs("uploads", exist_ok=True)
    with open("uploads/test.pdf", "w") as f:
        f.write("dummy pdf content")

    # Mock pdf2image.convert_from_path
    class MockImage:
        def save(self, path, format):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                f.write("dummy image content")

    def mock_convert_from_path(pdf_path, dpi=200):
        return [MockImage(), MockImage()] # Simulate 2 pages

    import pdf2image
    monkeypatch.setattr(pdf2image, "convert_from_path", mock_convert_from_path)
    
    # Run conversion
    process_pdf_conversion(doc_id, TestingSessionLocal)

    # Verify
    updated_doc = db_session.query(Document).filter(Document.id == doc_id).first()
    assert updated_doc.status == DocumentStatus.COMPLETED
    assert updated_doc.page_count == 2
    
    pages = db_session.query(FlipbookPage).filter(FlipbookPage.document_id == doc_id).all()
    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert os.path.exists(pages[0].image_path)

    # Cleanup
    shutil.rmtree("converted")
    os.remove("uploads/test.pdf")
