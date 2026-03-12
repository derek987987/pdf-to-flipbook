MAX_SIZE_MB = 500
MAX_PAGES = 200

def validate_pdf(file, page_count: int):
    """
    Validates PDF file size and page count.
    :param file: The file object (must have a .size attribute)
    :param page_count: The number of pages in the PDF
    """
    max_size_bytes = MAX_SIZE_MB * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValueError(f"File size exceeds {MAX_SIZE_MB}MB limit")
    
    if page_count > MAX_PAGES:
        raise ValueError(f"Page count exceeds {MAX_PAGES} pages limit")
