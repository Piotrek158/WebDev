from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import exams, terms, other, rooms
from app.database import engine
from app.models import Base
import os

# Tworzymy katalog na bazę danych jeśli nie istnieje
os.makedirs("data", exist_ok=True)

# Tworzymy tabele
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="System Organizacji Egzaminów",
    description="API do zarządzania egzaminami i terminami",
    version="1.0.0"
)

# CORS - zezwalamy na requesty z frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rejestrujemy routery
app.include_router(exams.router)
app.include_router(terms.router)
app.include_router(other.router)
app.include_router(rooms.router)


@app.get("/")
def root():
    return {
        "message": "System Organizacji Egzaminów API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
