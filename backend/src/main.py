from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .database import engine, Base
from .api import upload, status, viewer

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF to Flipbook API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred", "detail": str(exc)},
    )

@app.get("/")
async def root():
    return {"message": "Welcome to PDF to Flipbook API"}

# Include routers
app.include_router(upload.router, prefix="/api/v1")
app.include_router(status.router, prefix="/api/v1")
app.include_router(viewer.router, prefix="/api/v1")
