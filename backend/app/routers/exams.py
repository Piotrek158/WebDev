from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud, models
from app.database import get_db

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.post("/", response_model=schemas.ExamResponse)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(get_db)):
    """Tworzy nowy egzamin (admin)"""
    return crud.create_exam(db, exam)


@router.get("/", response_model=List[schemas.ExamResponse])
def list_exams(
    kierunek: Optional[str] = Query(None),
    typ_studiow: Optional[models.TypStudiow] = Query(None),
    rok: Optional[int] = Query(None),
    prowadzacy_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista egzaminów z filtrowaniem"""
    return crud.get_exams(db, kierunek, typ_studiow, rok, prowadzacy_name)


@router.get("/{exam_id}", response_model=schemas.ExamResponse)
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    """Szczegóły egzaminu"""
    exam = crud.get_exam(db, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Egzamin nie znaleziony")
    return exam
