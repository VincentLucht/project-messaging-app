[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

# Frontend - Real-Time Messaging App
The Frontend for the [real-time messaging app](https://github.com/VincentLucht/project-messaging-app) built with React and TypeScript. Features real-time chats via Socket.IO and a responsive design down to 360px via Tailwind CSS.

## ✨ Key Features
- Real-time messaging with Socket.IO
- View and manage all chats
- Uses Virtualization and pagination to optimize performance
- Typing indicators and online status
- Unread message notifications
- Responsive design (down to 360px)
- Persistent login and user authentication using JWTs in local storage
- Message encryption/decryption via AES-256

## 🧰 Installation & Setup
### ‼️ Prerequisites
You <u>need</u> 2 environment variables:

`VITE_SECRET_KEY_ENC` (NEEDS TO MATCH WITH BACKEND)

`VITE_API_URL` (backend URL)

### ⚙️ Installation
Clone the Project:
```bash
git clone https://github.com/VincentLucht/project-messaging-app.git
```

Go to the project directory and then into the frontend dir:
```bash
cd project-messaging-app
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the server:
```bash
npm run dev
```

## ⚡️ Tech Stack
[![Tech Stack](https://skillicons.dev/icons?i=ts,react,tailwind,vite)](https://skillicons.dev)