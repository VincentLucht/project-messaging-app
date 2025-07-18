[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

# Frontend - Echtzeit Messaging App
Das Frontend für die [Echtzeit Messaging App](https://github.com/VincentLucht/project-messaging-app), entwickelt mit React und TypeScript. Bietet Echtzeit-Chats über Socket.IO und ein responsives Design bis zu 360px mithilfe von Tailwind CSS.

## ✨ Features
- Echtzeit-Messaging mit Socket.IO
- Anzeige und Verwaltung aller Chats
- Verwendet Virtualisierung und Paginierung zur Leistungsoptimierung
- Tipp-Indikatoren und Online Status
- Benachrichtigungen für ungelesene Nachrichten
- Responsives Design (bis zu 360px)
- Dauerhafte Anmeldung und Benutzerauthentifizierung mit JWTs im lokalen Speicher
- Nachrichtenverschlüsselung/-entschlüsselung via AES-256

## 🧰 Installation & Einrichtung
### ‼️ Voraussetzungen
Du <u>benötigst</u> 2 environment variables:

`VITE_SECRET_KEY_ENC` (MUSS MIT DEM BACKEND ÜBEREINSTIMMEN)

`VITE_API_URL` (Backend URL)

### ⚙️ Installation
Klone das Projekt:
```bash
git clone https://github.com/VincentLucht/project-messaging-app.git
```

Öffne das directory und gehe anschließend in den Frontend Ordner:
```bash
cd project-messaging-app
cd frontend
```

Installiere die dependencies:
```bash
npm install
```

Starte den Server:
```bash
npm run dev
```

Führe das Seed Skript aus (optional):
```bash
npm run db
```

## ⚡️ Tech Stack
[![Tech Stack](https://skillicons.dev/icons?i=ts,react,tailwind,vite)](https://skillicons.dev)