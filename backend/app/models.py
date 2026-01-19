from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    STUDENT = "student"
    STAROSTA = "starosta"
    PROWADZACY = "prowadzacy"
    ADMIN = "admin"


class TypStudiow(str, enum.Enum):
    STACJONARNE_I = "stacjonarne_I"
    STACJONARNE_II = "stacjonarne_II"
    NIESTACJONARNE_I = "niestacjonarne_I"
    NIESTACJONARNE_II = "niestacjonarne_II"


class TermStatus(str, enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REJECTED = "rejected"


class DemoUser(Base):
    """Przykładowi użytkownicy do dropdowna"""
    __tablename__ = "demo_users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    kierunek = Column(String, nullable=True)
    typ_studiow = Column(SQLEnum(TypStudiow), nullable=True)
    rok = Column(Integer, nullable=True)
    przedmiot = Column(String, nullable=True)  # dla prowadzących


class Subject(Base):
    """Przedmioty z planu studiów"""
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String, nullable=False)
    kierunek = Column(String, nullable=False)
    typ_studiow = Column(SQLEnum(TypStudiow), nullable=False)
    rok = Column(Integer, nullable=False)
    
    exams = relationship("Exam", back_populates="subject")


class Exam(Base):
    """Egzaminy"""
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    prowadzacy_name = Column(String, nullable=False)
    
    subject = relationship("Subject", back_populates="exams")
    terms = relationship("ExamTerm", back_populates="exam")


class ExamTerm(Base):
    """Terminy egzaminów (propozycje i zatwierdzone)"""
    __tablename__ = "exam_terms"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    data = Column(String, nullable=False)  # format: YYYY-MM-DD
    godzina = Column(String, nullable=False)  # format: HH:MM
    sala = Column(String, nullable=False)
    proposed_by_role = Column(SQLEnum(UserRole), nullable=False)
    proposed_by_name = Column(String, nullable=False)
    approved_by_role = Column(SQLEnum(UserRole), nullable=True)
    approved_by_name = Column(String, nullable=True)
    status = Column(SQLEnum(TermStatus), default=TermStatus.PROPOSED)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    exam = relationship("Exam", back_populates="terms")


class SessionPeriod(Base):
    """Okresy sesji egzaminacyjnych"""
    __tablename__ = "session_periods"

    id = Column(Integer, primary_key=True, index=True)
    semestr = Column(String, nullable=False)  # "zimowy" lub "letni"
    rok_akademicki = Column(String, nullable=False)  # np. "2024/2025"
    data_start = Column(String, nullable=False)  # YYYY-MM-DD
    data_end = Column(String, nullable=False)  # YYYY-MM-DD


class Room(Base):
    """Sale egzaminacyjne"""
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String, nullable=False, unique=True)
    budynek = Column(String, nullable=False)
    pojemnosc = Column(Integer, nullable=False)  # liczba miejsc
    typ = Column(String, nullable=True)  # np. "sala wykładowa", "laboratorium", "sala ćwiczeniowa"
