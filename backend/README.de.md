[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

# Backend - Echtzeit Messaging App
Das Backend für die [Echtzeit Messaging App](https://github.com/VincentLucht/project-messaging-app), entwickelt mit Node.js, TypeScript und Socket.IO. Bietet eine REST API mit Echtzeit Socket.IO Integration, JWT-Authentifizierung und PostgreSQL Datenbank mit Prisma ORM.

## ✨ Architektur und Features
### HTTP + Socket.IO Integration
- **REST API:** Traditionelle HTTP-Endpunkte für Benutzerauthentifizierung, Chat-Verwaltung und Nachrichtenverwaltung
- **Socket.IO Server:** Echtzeit-WebSocket-Verbindungen für sofortiges Messaging, Tipp-Indikatoren und Live User-Präsenz
- **Hybrid-Ansatz:** Kombiniert die Zuverlässigkeit von REST mit den Echtzeit-Fähigkeiten von WebSockets

### Sicherheitsfeatures
- **JWT-Authentifizierung:** Sichere Token-basierte Benutzerauthentifizierung
- **Nachrichtenverschlüsselung:** AES-256-Verschlüsselung für alle Nachrichten
- **Eingabevalidierung:** Request-Validierung
- **CORS-Konfiguration:** CORS erlaubt nur Anfragen von spezifizierten Routen
- **Echtzeit-Sicherheit:** Socket-Event-Authentifizierung und -Validierung

## 🧰 Installation & Einrichtung
### ‼️ Voraussetzungen
Du <u>benötigst</u> diese environment variables:

`DATABASE_URL_LOCAL`

`SECRET_KEY` (JWT Secret Key)

`SECRET_KEY_ENC` (MUSS MIT DEM FRONTEND ÜBEREINSTIMMEN)

`FRONTEND_URL`


`Port` (optional)

### ⚙️ Installation
Klone das Projekt:
```bash
git clone https://github.com/VincentLucht/project-messaging-app.git
```

Öffne das directory und gehe anschließend in den Backend Ordner:
```bash
cd project-messaging-app
cd backend
```

Installiere die dependencies:
```bash
npm install
```

Richte die Datenbank ein:
```bash
npx prisma generate
```

Starte den Server:
```bash
npm run dev
```

Führe das Seed Skript aus (optional):
```bash
npm run db
```

Tests ausführen (optional):
```bash
npm test
```

## ⚡️ Tech Stack
[![Tech Stack](https://skillicons.dev/icons?i=ts,nodejs,express,prisma,postgresql,socketio)](https://skillicons.dev)