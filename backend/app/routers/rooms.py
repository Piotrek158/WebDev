from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud, models
from app.database import get_db

router = APIRouter(prefix="/api", tags=["rooms"])


@router.post("/rooms", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    """Tworzy nową salę (admin)"""
    # Sprawdź czy sala o takiej nazwie już istnieje
    existing = crud.get_room_by_name(db, room.nazwa)
    if existing:
        raise HTTPException(status_code=400, detail=f"Sala '{room.nazwa}' już istnieje")

    return crud.create_room(db, room)


@router.get("/rooms", response_model=List[schemas.RoomResponse])
def list_rooms(db: Session = Depends(get_db)):
    """Pobiera listę wszystkich sal"""
    return crud.get_rooms(db)


@router.get("/rooms/{nazwa}", response_model=schemas.RoomResponse)
def get_room(nazwa: str, db: Session = Depends(get_db)):
    """Pobiera szczegóły sali po nazwie"""
    room = crud.get_room_by_name(db, nazwa)
    if not room:
        raise HTTPException(status_code=404, detail=f"Sala '{nazwa}' nie została znaleziona")
    return room


@router.post("/rooms/check-availability", response_model=schemas.RoomAvailabilityResponse)
def check_room_availability(
    request: schemas.RoomAvailabilityRequest,
    db: Session = Depends(get_db)
):
    """
    Sprawdza dostępność sali dla określonej liczby osób w danym terminie

    Sprawdza:
    - Czy sala istnieje
    - Czy ma odpowiednią pojemność
    - Czy jest dostępna w danym terminie (nie jest zajęta)
    """
    result = crud.check_room_capacity_and_availability(
        db,
        sala=request.sala,
        data=request.data,
        godzina=request.godzina,
        liczba_osob=request.liczba_osob
    )

    return schemas.RoomAvailabilityResponse(
        available=result["available"],
        message=result["message"],
        sala=result["room"]
    )
