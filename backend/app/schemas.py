from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, TypStudiow, TermStatus


# Demo Users
class DemoUserResponse(BaseModel):
    id: int
    name: str
    role: UserRole
    kierunek: Optional[str]
    typ_studiow: Optional[TypStudiow]
    rok: Optional[int]
    przedmiot: Optional[str]
    
    class Config:
        from_attributes = True


# Subjects
class SubjectCreate(BaseModel):
    nazwa: str
    kierunek: str
    typ_studiow: TypStudiow
    rok: int


class SubjectResponse(BaseModel):
    id: int
    nazwa: str
    kierunek: str
    typ_studiow: TypStudiow
    rok: int
    
    class Config:
        from_attributes = True


# Exams
class ExamCreate(BaseModel):
    subject_id: int
    prowadzacy_name: str


class ExamResponse(BaseModel):
    id: int
    subject_id: int
    prowadzacy_name: str
    subject: SubjectResponse
    
    class Config:
        from_attributes = True


# Exam Terms
class ExamTermCreate(BaseModel):
    exam_id: int
    data: str  # YYYY-MM-DD
    godzina: str  # HH:MM
    sala: str
    proposed_by_role: UserRole
    proposed_by_name: str


class ExamTermApprove(BaseModel):
    approved_by_role: UserRole
    approved_by_name: str
    status: TermStatus  # APPROVED lub REJECTED


class ExamTermResponse(BaseModel):
    id: int
    exam_id: int
    data: str
    godzina: str
    sala: str
    proposed_by_role: UserRole
    proposed_by_name: str
    approved_by_role: Optional[UserRole]
    approved_by_name: Optional[str]
    status: TermStatus
    created_at: datetime
    exam: ExamResponse
    
    class Config:
        from_attributes = True


# Session Periods
class SessionPeriodCreate(BaseModel):
    semestr: str
    rok_akademicki: str
    data_start: str
    data_end: str


class SessionPeriodResponse(BaseModel):
    id: int
    semestr: str
    rok_akademicki: str
    data_start: str
    data_end: str
    
    class Config:
        from_attributes = True


# Validation responses
class ValidationResponse(BaseModel):
    valid: bool
    message: Optional[str] = None


# Rooms
class RoomCreate(BaseModel):
    nazwa: str
    budynek: str
    pojemnosc: int
    typ: Optional[str] = None


class RoomResponse(BaseModel):
    id: int
    nazwa: str
    budynek: str
    pojemnosc: int
    typ: Optional[str]

    class Config:
        from_attributes = True


class RoomAvailabilityRequest(BaseModel):
    sala: str
    data: str  # YYYY-MM-DD
    godzina: str  # HH:MM
    liczba_osob: int


class RoomAvailabilityResponse(BaseModel):
    available: bool
    message: str
    sala: Optional[RoomResponse] = None
