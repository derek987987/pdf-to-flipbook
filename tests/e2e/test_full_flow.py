import pytest
import os
import shutil
import time
from fastapi.testclient import TestClient
from backend.src.main import app
from backend.src.database import Base, engine, get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_full_upload_to_read_flow():
    # 1. Upload
    doc_id = None
    test_pdf = "backend/tests/integration/test_full.pdf"
    os.makedirs("backend/tests/integration", exist_ok=True)
    with open(test_pdf, "wb") as f:
        f.write(b"dummy pdf content")
    
    # Mocking pdfinfo_from_path and convert_from_path
    import pdf2image
    def mock_info(path): return {"Pages": 1}
    
    class MockImg:
        def save(self, p, f): 
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, "w") as f: f.write("img")
    def mock_convert(path, dpi=200): 
        return [MockImg()]
    
    import unittest.mock as mock
    with mock.patch("pdf2image.pdfinfo_from_path", side_effect=mock_info), \
         mock.patch("pdf2image.convert_from_path", side_effect=mock_convert):
         
        with open(test_pdf, "rb") as f:
            response = client.post("/api/v1/upload", files={"file": ("test.pdf", f, "application/pdf")})
        
        assert response.status_code == 201
        doc_id = response.json()["id"]

        # 2. Poll Status
        for _ in range(10):
            response = client.get(f"/api/v1/status/{doc_id}")
            if response.json()["status"] == "COMPLETED":
                break
            time.sleep(1)
        
        assert response.json()["status"] == "COMPLETED"

        # 3. Get Metadata
        response = client.get(f"/api/v1/viewer/{doc_id}")
        assert response.status_code == 200
        assert response.json()["page_count"] == 1
        page_url = response.json()["pages"][0]

        # 4. Get Image
        # The page_url contains the full domain, we need to extract the path
        # For TestClient, we can just use the path
        from urllib.parse import urlparse
        path = urlparse(page_url).path
        response = client.get(path)
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/jpeg"

    # Cleanup
    if os.path.exists("uploads"): shutil.rmtree("uploads")
    if os.path.exists("converted"): shutil.rmtree("converted")
    if os.path.exists(test_pdf): os.remove(test_pdf)
