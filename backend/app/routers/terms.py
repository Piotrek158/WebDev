from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud, models
from app.database import get_db

router = APIRouter(prefix="/api/exam-terms", tags=["exam-terms"])


@router.post("/", response_model=schemas.ExamTermResponse)
def create_exam_term(term: schemas.ExamTermCreate, db: Session = Depends(get_db)):
    """Tworzy propozycję terminu egzaminu z walidacją"""
    
    # Sprawdź czy egzamin istnieje
    exam = crud.get_exam(db, term.exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Egzamin nie znaleziony")
    
    # Walidacja: czy sala jest wolna
    if not crud.check_room_availability(db, term.data, term.godzina, term.sala):
        raise HTTPException(
            status_code=400, 
            detail=f"Sala {term.sala} jest już zajęta w dniu {term.data} o godzinie {term.godzina}"
        )
    
    # Walidacja: czy studenci nie mają już egzaminu tego dnia
    if not crud.check_student_availability(
        db, 
        term.data, 
        exam.subject.kierunek, 
        exam.subject.typ_studiow, 
        exam.subject.rok
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Studenci {exam.subject.kierunek} ({exam.subject.typ_studiow}, rok {exam.subject.rok}) mają już egzamin w dniu {term.data}"
        )
    
    return crud.create_exam_term(db, term)


@router.get("/", response_model=List[schemas.ExamTermResponse])
def list_exam_terms(
    kierunek: Optional[str] = Query(None),
    typ_studiow: Optional[models.TypStudiow] = Query(None),
    rok: Optional[int] = Query(None),
    status: Optional[models.TermStatus] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista terminów egzaminów z filtrowaniem"""
    return crud.get_exam_terms(db, kierunek, typ_studiow, rok, status)


@router.get("/{term_id}", response_model=schemas.ExamTermResponse)
def get_exam_term(term_id: int, db: Session = Depends(get_db)):
    """Szczegóły terminu egzaminu"""
    term = crud.get_exam_term(db, term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Termin nie znaleziony")
    return term


@router.put("/{term_id}", response_model=schemas.ExamTermResponse)
def approve_exam_term(
    term_id: int, 
    approval: schemas.ExamTermApprove, 
    db: Session = Depends(get_db)
):
    """Zatwierdza lub odrzuca propozycję terminu"""
    term = crud.update_exam_term(db, term_id, approval)
    if not term:
        raise HTTPException(status_code=404, detail="Termin nie znaleziony")
    return term


@router.get("/validation/check-room", response_model=schemas.ValidationResponse)
def validate_room(
    data: str = Query(...),
    godzina: str = Query(...),
    sala: str = Query(...),
    exclude_term_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Sprawdza dostępność sali"""
    is_available = crud.check_room_availability(db, data, godzina, sala, exclude_term_id)
    return schemas.ValidationResponse(
        valid=is_available,
        message=None if is_available else f"Sala {sala} jest już zajęta"
    )


@router.get("/validation/check-students", response_model=schemas.ValidationResponse)
def validate_students(
    data: str = Query(...),
    kierunek: str = Query(...),
    typ_studiow: models.TypStudiow = Query(...),
    rok: int = Query(...),
    exclude_term_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Sprawdza czy studenci nie mają kolizji egzaminów"""
    is_available = crud.check_student_availability(
        db, data, kierunek, typ_studiow, rok, exclude_term_id
    )
    return schemas.ValidationResponse(
        valid=is_available,
        message=None if is_available else "Studenci mają już egzamin tego dnia"
    )
