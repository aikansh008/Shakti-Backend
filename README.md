# 🚀 Shakti Backend

Shakti is a community-driven business platform to empower entrepreneurs, startups, and innovators. This repository contains the **backend** codebase, built using **Node.js**, **Express**, and **MongoDB**, featuring modular APIs, secure authentication, and real-time chat support.

- 🔐 JWT Authentication
- 📡 RESTful APIs
- 💬 Socket.IO Real-time Messaging
- 🐳 Dockerized
- 🌍 Deployed on AWS EC2
- 🛡 Secure & Scalable

---

## 📁 Project Structure

shakti-backend/
│
├── .vscode/ # VS Code workspace settings
├── BudgetPrediction/ # Module for budget prediction features
├── Controllers/ # Route handler logic (controllers)
├── Middlewares/ # Express middlewares (auth, logging, etc.)
├── Models/ # Mongoose/DB models
├── Routes/ # Route definitions
├── services/ # Business logic and services
├── utils/ # Utility/helper functions
│
├── .dockerignore # Files/directories to ignore by Docker
├── .env # Environment variables
├── .gitattributes # Git attributes
├── .gitignore # Git ignore file
│
├── app.js # Main Express app entry point
├── data.json # Static or mock data
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile # Docker build configuration
├── dump.rdb # Redis dump file
├── frontend.html # Placeholder frontend file
├── index.js # Possibly the starting point of the app
├── package-lock.json # Auto-generated dependency tree lock
├── package.json # Project metadata and dependencies
├── redis.js # Redis connection logic
├── script.js # Custom scripts or automation
├── server.js # App bootstrap server file
├── tempUserStore.js # Temporary user storage (likely session/cache)
├── test.js # Test script
├── testing.yaml # YAML config for tests
└── workflows.yml # GitHub Actions or CI/CD workflow

---

## ⚙️ Features

- 👥 **3-Step Signup** with Google OAuth
- 🧾 Business Profile & Finance Tracking APIs
- 💬 **Real-Time Chat** with Socket.IO
- 🧠 AI Document Recommendation (PDF + Web scraping)
- 🔒 **JWT-based Secure Authentication**
- 📦 **Dockerized** for easy deployment
- 🌐 **CORS-enabled** for frontend communication

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas/local) |
| Auth | Google OAuth 2.0 + JWT |
| Real-time | Socket.IO |
| Deployment | Docker + EC2 |
| Docs | Postman / Swagger (TBD) |

---
## 🚀 Getting Started (Local)

Follow the steps below to run the backend locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/shakti-backend.git
cd shakti-backend

### 2.
