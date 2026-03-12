import pytest
import datetime
import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.src.database import Base
from backend.src.models.document import Document, DocumentStatus, FlipbookPage
from backend.src.services.cleanup_service import cleanup_expired_documents

# Use a separate test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sql_app.db"
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

def test_cleanup_deletes_expired_docs(db_session, monkeypatch):
    # Setup: Create an expired and a non-expired document
    now = datetime.datetime.utcnow()
    expired_at = now - datetime.timedelta(hours=1)
    not_expired_at = now + datetime.timedelta(hours=1)

    expired_doc = Document(id="expired-id", original_name="expired.pdf", expires_at=expired_at, status=DocumentStatus.COMPLETED)
    not_expired_doc = Document(id="valid-id", original_name="valid.pdf", expires_at=not_expired_at, status=DocumentStatus.COMPLETED)

    db_session.add(expired_doc)
    db_session.add(not_expired_doc)
    db_session.commit()

    # Mock SessionLocal to use TestingSessionLocal
    import backend.src.services.cleanup_service as cleanup_service
    monkeypatch.setattr(cleanup_service, "SessionLocal", TestingSessionLocal)

    # Mock filesystem operations
    monkeypatch.setattr(os.path, "exists", lambda x: False)
    
    # Run cleanup
    cleanup_expired_documents()

    # Verify
    remaining_docs = db_session.query(Document).all()
    assert len(remaining_docs) == 1
    assert remaining_docs[0].id == "valid-id"
