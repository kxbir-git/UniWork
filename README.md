# UniWork — University Freelancing Marketplace
### Full-Stack MERN + React Native (Expo) Edition

[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%204.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-In--Memory%20%2F%20Mongo-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

UniWork is a complete, production-grade university freelancing web and mobile application built with the **MERN stack** (Node.js, Express, MongoDB / in-memory persistent database) and a **React Native (Expo)** frontend running seamlessly on Web, Android, and iOS.

It features a **hand-crafted Light White Theme** design system (crisp typography, subtle borders, soft shadows — avoiding generic AI-generated aesthetics), and a **simulated milestone escrow accounting ledger**.

---

## 1. Key Features

- **Cross-Platform React Native (Expo)**:
  - Single unified codebase that renders natively on Web browsers (`expo start --web`), Android devices, and iOS.
  - Clean light white theme with custom design tokens (`theme/colors.js`), tailored responsive layouts, and zero heavy bloat.
- **Node.js & Express REST Backend**:
  - Modular layered architecture: `config`, `controllers`, `middleware`, `models`, `routes`, `utils`.
  - JWT token-based authentication with role-based middleware (`clientOnly`, `freelancerOnly`).
  - **Zero-Dependency Database Mode**: Automatically uses an in-memory/JSON persistent database (`backend/data/db.json`) if MongoDB is not installed locally, with automatic seed data on startup! Or connect to MongoDB Atlas by providing `MONGO_URI`.
- **Marketplace & Bidding**:
  - Filter jobs by discipline, budget model (fixed vs. hourly), experience level, and keyword search.
  - Client project posting with skill tagging.
  - Student freelancer proposal submission with bid amount, delivery days, and cover letter.
  - Client review console: Shortlist, Decline, or **Accept & Hire**.
- **Simulated Milestone Escrow System**:
  - Double-entry accounting tracking `Wallet` balance and `escrowHeld`.
  - When a freelancer is hired, an active `Contract` is initiated and funds are locked into escrow.
  - Freelancers submit deliverables with text notes and repository attachments.
  - Clients approve deliverables with a single click, releasing escrow funds directly into the freelancer's wallet.
  - Direct workroom messaging with automated system event notifications.

---

## 2. Project Structure

```
UniWork/
├── backend/                       # Node.js + Express + Database Backend
│   ├── data/                      # Auto-persisted JSON database (db.json)
│   ├── src/
│   │   ├── config/                # DB connection (MongoDB / In-memory fallback)
│   │   ├── controllers/           # Auth, Jobs, Proposals, Contracts, Wallet, Messages, Dashboard
│   │   ├── middleware/            # JWT Protect & Role Check middleware
│   │   ├── mockDb/                # In-memory persistent database engine & models
│   │   ├── models/                # Schema definitions & model router
│   │   ├── routes/                # Express API route modules
│   │   ├── utils/                 # Auto-seeder with pre-configured personas
│   │   └── server.js              # Express app entrypoint (Port 5000)
│   ├── package.json
│   └── .env
│
├── frontend/                      # React Native (Expo) Frontend
│   ├── src/
│   │   ├── components/            # Navbar, Button, Badge, StatTile, Cards
│   │   ├── context/               # AuthContext (JWT, user state, wallet balance)
│   │   ├── screens/               # Home, Jobs, JobDetail, PostJob, ContractRoom,
│   │   │                          # ContractsList, Dashboard, Wallet, Login, Register, HowItWorks
│   │   ├── services/              # Axios API client (http://localhost:5000/api)
│   │   └── theme/                 # Clean White Design System Tokens
│   ├── App.js                     # Root component & screen router
│   ├── app.json                   # Expo configuration
│   └── package.json
│
├── package.json                   # Root workspace scripts
└── README.md
```

---

## 3. How to Run the Project

### Step 1: Start the Backend Server (Terminal 1)
```powershell
cd C:\Project\UniWork\backend
npm start
```
*Output will show:*
```text
⚡ In-Memory / File Database Active (Data persisted at backend/data/db.json)
🌱 Seeding initial demo data for evaluation...
✅ Demo data seeded successfully!
🚀 UniWork MERN Backend running on port 5000
📡 API Health: http://localhost:5000/api/health
```

### Step 2: Start the React Native Expo Frontend (Terminal 2)
In a second terminal window:
```powershell
cd C:\Project\UniWork\frontend
npm run web
```
This will open the application directly in your web browser at **http://localhost:8081/** (or press `w` in terminal).

*(To test on a physical Android or iPhone device, install the Expo Go app and run `npx expo start`, then scan the terminal QR code).*

---

## 4. Pre-configured Demo Accounts for Evaluation

The database is pre-seeded with ready-to-test personas. You can log in using these credentials or click the **Examiner Demo Autofill** buttons on the Login page:

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Client** | `client.sarah@uniwork.local` | `Password123!` | Stanford Health Lab: Active oncology contract with Alex, pending deliverable to approve |
| **Client** | `client.david@uniwork.local` | `Password123!` | EduTech Ventures: Active NLP contract, posted projects |
| **Freelancer** | `freelancer.alex@uniwork.local` | `Password123!` | UC Berkeley CS Senior: Active contracts, $1,450 wallet balance, submitted deliverables |
| **Freelancer** | `freelancer.priya@uniwork.local` | `Password123!` | MIT Media Lab: UI/UX designer, $1,980 wallet balance |
| **Administrator** | `admin@uniwork.local` | `AdminPass123!` | Full platform access |

---

## 5. API Reference Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student or client | No |
| `POST` | `/api/auth/login` | Authenticate and return JWT token | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile & wallet | Yes (Bearer) |
| `GET` | `/api/jobs` | Get jobs with query, category, budget filters | No |
| `POST` | `/api/jobs` | Post a new job | Yes (Client) |
| `GET` | `/api/jobs/:id` | Get single job details & proposal status | Optional |
| `POST` | `/api/proposals` | Submit a proposal on a project | Yes (Freelancer) |
| `GET` | `/api/contracts` | List user's active/completed contracts | Yes |
| `GET` | `/api/contracts/:id` | Enter contract room (milestones & messages) | Yes |
| `POST` | `/api/contracts/:id/milestones/:mId/submit` | Upload deliverable for milestone | Yes (Freelancer) |
| `POST` | `/api/contracts/:id/milestones/:mId/approve` | Release escrow funds to freelancer | Yes (Client) |
| `GET` | `/api/contracts/:id/messages` | Read workroom chat messages | Yes |
| `POST` | `/api/contracts/:id/messages` | Send workroom chat message | Yes |
| `GET` | `/api/wallet` | Get balance and transaction ledger | Yes |
| `POST` | `/api/wallet/deposit` | Deposit simulated test funds | Yes |
| `GET` | `/api/dashboard/stats` | Homepage platform statistics | No |
