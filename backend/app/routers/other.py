from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud, models
from app.database import get_db

router = APIRouter(prefix="/api", tags=["other"])


# Session Periods
@router.post("/session-periods", response_model=schemas.SessionPeriodResponse)
def create_session_period(period: schemas.SessionPeriodCreate, db: Session = Depends(get_db)):
    """Tworzy okres sesji (admin)"""
    return crud.create_session_period(db, period)


@router.get("/session-periods", response_model=List[schemas.SessionPeriodResponse])
def list_session_periods(db: Session = Depends(get_db)):
    """Lista okresów sesji"""
    return crud.get_session_periods(db)


# Subjects
@router.post("/subjects", response_model=schemas.SubjectResponse)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    """Dodaje przedmiot (admin)"""
    return crud.create_subject(db, subject)


@router.get("/subjects", response_model=List[schemas.SubjectResponse])
def list_subjects(
    kierunek: Optional[str] = Query(None),
    typ_studiow: Optional[models.TypStudiow] = Query(None),
    rok: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista przedmiotów z filtrowaniem"""
    return crud.get_subjects(db, kierunek, typ_studiow, rok)


# Demo Users
@router.get("/demo-users", response_model=List[schemas.DemoUserResponse])
def list_demo_users(db: Session = Depends(get_db)):
    """Lista przykładowych użytkowników do dropdowna"""
    return crud.get_demo_users(db)
