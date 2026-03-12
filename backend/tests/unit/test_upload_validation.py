import pytest
from backend.src.services.upload_service import validate_pdf

class MockFile:
    def __init__(self, size):
        self.size = size

def test_validate_pdf_size_too_large():
    # 51 MB
    mock_file = MockFile(51 * 1024 * 1024)
    with pytest.raises(ValueError, match="File size exceeds 50MB limit"):
        validate_pdf(mock_file, page_count=10)

def test_validate_pdf_pages_too_many():
    mock_file = MockFile(10 * 1024 * 1024)
    with pytest.raises(ValueError, match="Page count exceeds 200 pages limit"):
        validate_pdf(mock_file, page_count=201)

def test_validate_pdf_valid():
    mock_file = MockFile(10 * 1024 * 1024)
    # Should not raise any exception
    validate_pdf(mock_file, page_count=100)
