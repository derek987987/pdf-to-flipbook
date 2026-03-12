import uuid
import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class DocumentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    original_name = Column(String)
    pdf_path = Column(String)
    status = Column(Enum(DocumentStatus))
    page_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)
    error_message = Column(String, nullable=True)

    pages = relationship("FlipbookPage", back_populates="document", cascade="all, delete-orphan")

class FlipbookPage(Base):
    __tablename__ = "flipbook_pages"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    page_number = Column(Integer)
    image_path = Column(String)

    document = relationship("Document", back_populates="pages")
