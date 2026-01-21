FROM node:18-alpine

WORKDIR /app

# Kopiujemy package files
COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę aplikacji
COPY . .

# Ekspozycja portu
EXPOSE 3000

# Uruchamiamy dev server
CMD ["npm", "start"]
