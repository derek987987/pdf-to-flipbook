import pytest
import os
import uuid
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.src.database import Base
from backend.src.models.document import Document, DocumentStatus, FlipbookPage
from fastapi.testclient import TestClient
from backend.src.main import app
from backend.src.database import get_db

# Use a separate test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_viewer.db"
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

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

def test_get_viewer_metadata(client, db_session):
    # Setup: Create a COMPLETED document with pages
    doc_id = str(uuid.uuid4())
    doc = Document(id=doc_id, original_name="test.pdf", status=DocumentStatus.COMPLETED, page_count=2)
    db_session.add(doc)
    
    page1 = FlipbookPage(id=str(uuid.uuid4()), document_id=doc_id, page_number=1, image_path="converted/test/1.jpg")
    page2 = FlipbookPage(id=str(uuid.uuid4()), document_id=doc_id, page_number=2, image_path="converted/test/2.jpg")
    db_session.add(page1)
    db_session.add(page2)
    db_session.commit()

    response = client.get(f"/api/v1/viewer/{doc_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc_id
    assert data["page_count"] == 2
    assert len(data["pages"]) == 2
    assert "api/v1/pages" in data["pages"][0]

def test_get_page_image(client, db_session, monkeypatch):
    # Setup
    doc_id = str(uuid.uuid4())
    img_path = "test_page.jpg"
    with open(img_path, "wb") as f:
        f.write(b"dummy image")
        
    page = FlipbookPage(id=str(uuid.uuid4()), document_id=doc_id, page_number=1, image_path=img_path)
    db_session.add(page)
    db_session.commit()

    response = client.get(f"/api/v1/pages/{doc_id}/1")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == b"dummy image"

    # Cleanup
    os.remove(img_path)
