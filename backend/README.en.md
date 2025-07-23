[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

# Backend - Real-Time Messaging App
The Backend for the [real-time messaging app](https://github.com/VincentLucht/project-messaging-app) built with Node.js, TypeScript, and Socket.IO. Features a REST API with real-time Socket.IO integration, JWT authentication, and PostgreSQL database with Prisma ORM.

## ✨ Architecture and key features
### HTTP + Socket.IO Integration
- **REST API:** Traditional HTTP endpoints for user authentication, chat management, and message operations
- **Socket.IO Server:** Real-time WebSocket connections for instant messaging, typing indicators, and live user presence
- **Hybrid Approach:** Combines the reliability of REST with the real-time capabilities of WebSockets

### Security Features
- **JWT Authentication:** Secure token-based user authentication
- **Message Encryption:** AES-256 encryption for all messages
- **Input Validation:** Request validation
- **CORS Configuration:** CORS only allows requests from specified routes
- **Real-time Security:** Socket event authentication and validation

## 🧰 Installation & Setup
### ‼️ Prerequisites
You <u>need</u> these environment variables:

`DATABASE_URL_LOCAL`

`SECRET_KEY` (JWT secret key)

`SECRET_KEY_ENC` (NEEDS TO MATCH WITH FRONTEND)

`FRONTEND_URL`


`Port` (optional)

### ⚙️ Installation
Clone the Project:
```bash
git clone https://github.com/VincentLucht/project-messaging-app.git
```

Go to the project directory and then into the backend dir:
```bash
cd project-messaging-app
cd backend
```

Install dependencies:
```bash
npm install
```

Set up the database:
```bash
npx prisma generate
```

Start the server:
```bash
npm run dev
```

Run the seed script (optional):
```bash
npm run db
```

Run tests (optional):
```bash
npm test
```

## ⚡️ Tech Stack
[![Tech Stack](https://skillicons.dev/icons?i=ts,nodejs,express,prisma,postgresql,socketio)](https://skillicons.dev)
