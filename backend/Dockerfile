FROM python:3.11-slim

WORKDIR /app

# Instalujemy curl dla healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Kopiujemy requirements i instalujemy zależności
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy aplikację
COPY . .

# Tworzymy katalog na bazę danych
RUN mkdir -p /app/data

# Ekspozycja portu
EXPOSE 8000

# Tworzymy skrypt startowy
RUN echo '#!/bin/sh\n\
if [ ! -f /app/data/exams.db ]; then\n\
  echo "Inicjalizacja bazy danych..."\n\
  python init_db.py\n\
fi\n\
echo "Uruchamianie serwera..."\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh && \
chmod +x /app/start.sh

# Uruchamiamy serwer przez skrypt startowy
CMD ["/app/start.sh"]
