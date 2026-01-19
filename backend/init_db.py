"""
Skrypt do inicjalizacji bazy danych z przykładowymi danymi
Uruchom: python init_db.py
"""
from app.database import SessionLocal, engine
from app.models import Base, DemoUser, Subject, Exam, SessionPeriod, Room, UserRole, TypStudiow
import os

# Tworzymy katalog na bazę
os.makedirs("data", exist_ok=True)

# Tworzymy tabele
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Czyścimy istniejące dane (opcjonalnie)
print("Inicjalizacja bazy danych...")

# Demo Users
demo_users = [
    DemoUser(
        name="Jan Kowalski (Student, Informatyka, st. I, rok 2)",
        role=UserRole.STUDENT,
        kierunek="Informatyka",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=2
    ),
    DemoUser(
        name="Anna Nowak (Starosta, Informatyka, st. I, rok 2)",
        role=UserRole.STAROSTA,
        kierunek="Informatyka",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=2
    ),
    DemoUser(
        name="Dr Piotr Wiśniewski (Prowadzący, Bazy Danych)",
        role=UserRole.PROWADZACY,
        przedmiot="Bazy Danych"
    ),
    DemoUser(
        name="Prof. Maria Zawadzka (Prowadzący, Algorytmy)",
        role=UserRole.PROWADZACY,
        przedmiot="Algorytmy i Struktury Danych"
    ),
    DemoUser(
        name="Administrator",
        role=UserRole.ADMIN
    ),
    DemoUser(
        name="Marek Zieliński (Student, Zarządzanie, st. I, rok 1)",
        role=UserRole.STUDENT,
        kierunek="Zarządzanie",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=1
    ),
]

for user in demo_users:
    db.add(user)

# Rooms
rooms = [
    Room(nazwa="A101", budynek="A", pojemnosc=30, typ="sala wykładowa"),
    Room(nazwa="A102", budynek="A", pojemnosc=50, typ="sala wykładowa"),
    Room(nazwa="A103", budynek="A", pojemnosc=100, typ="aula"),
    Room(nazwa="B201", budynek="B", pojemnosc=25, typ="sala ćwiczeniowa"),
    Room(nazwa="B202", budynek="B", pojemnosc=20, typ="laboratorium"),
    Room(nazwa="B203", budynek="B", pojemnosc=40, typ="sala wykładowa"),
    Room(nazwa="C301", budynek="C", pojemnosc=15, typ="sala seminaryjna"),
    Room(nazwa="C302", budynek="C", pojemnosc=60, typ="sala wykładowa"),
    Room(nazwa="D101", budynek="D", pojemnosc=150, typ="aula"),
    Room(nazwa="D102", budynek="D", pojemnosc=35, typ="sala ćwiczeniowa"),
]

for room in rooms:
    db.add(room)

# Session Periods
session_periods = [
    SessionPeriod(
        semestr="zimowy",
        rok_akademicki="2024/2025",
        data_start="2025-01-20",
        data_end="2025-02-15"
    ),
    SessionPeriod(
        semestr="letni",
        rok_akademicki="2024/2025",
        data_start="2025-06-15",
        data_end="2025-07-10"
    ),
]

for period in session_periods:
    db.add(period)

# Subjects
subjects = [
    Subject(
        nazwa="Bazy Danych",
        kierunek="Informatyka",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=2
    ),
    Subject(
        nazwa="Algorytmy i Struktury Danych",
        kierunek="Informatyka",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=2
    ),
    Subject(
        nazwa="Programowanie Obiektowe",
        kierunek="Informatyka",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=2
    ),
    Subject(
        nazwa="Podstawy Marketingu",
        kierunek="Zarządzanie",
        typ_studiow=TypStudiow.STACJONARNE_I,
        rok=1
    ),
    Subject(
        nazwa="Matematyka",
        kierunek="Informatyka",
        typ_studiow=TypStudiow.NIESTACJONARNE_I,
        rok=1
    ),
]

for subject in subjects:
    db.add(subject)

db.commit()

# Exams (musimy pobrać subject_id po commicie)
db.refresh(subjects[0])
db.refresh(subjects[1])
db.refresh(subjects[2])
db.refresh(subjects[3])

exams = [
    Exam(subject_id=subjects[0].id, prowadzacy_name="Dr Piotr Wiśniewski"),
    Exam(subject_id=subjects[1].id, prowadzacy_name="Prof. Maria Zawadzka"),
    Exam(subject_id=subjects[2].id, prowadzacy_name="Dr Jan Kowalczyk"),
    Exam(subject_id=subjects[3].id, prowadzacy_name="Dr Anna Lewandowska"),
]

for exam in exams:
    db.add(exam)

db.commit()

print("✅ Baza danych zainicjalizowana!")
print(f"   Demo users: {len(demo_users)}")
print(f"   Sale: {len(rooms)}")
print(f"   Okresy sesji: {len(session_periods)}")
print(f"   Przedmioty: {len(subjects)}")
print(f"   Egzaminy: {len(exams)}")

db.close()
