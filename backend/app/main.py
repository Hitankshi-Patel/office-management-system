from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, projects, attendance, tickets, leaves

# Import models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Office Management System API",
    description="REST API for managing employees, HR, projects, attendance, and queries.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(attendance.router, prefix=API_PREFIX)
app.include_router(tickets.router, prefix=API_PREFIX)
app.include_router(leaves.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Office Management System API", "docs": "/docs"}
