# UniWork - University Freelancing Marketplace

[![Django 5.1](https://img.shields.io/badge/Django-5.1-0C4B33?logo=django)](https://www.djangoproject.com/)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)](https://www.python.org/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A complete, production-ready university freelancing marketplace web application built with **Python 3.12+**, **Django 5.x**, **Bootstrap 5**, and a **simulated milestone escrow ledger**. UniWork connects student and alumni freelancers with campus labs, startups, and clients seeking specialized project deliverables.

---

## 1. Key Features

- **Custom Authentication & Role Architecture**: Custom `User` model (`AbstractUser`) using unique emails, supporting dedicated **Client** and **Freelancer** user journeys.
- **Freelance Marketplace**:
  - Browse and search jobs with category filters, keyword search, budget filters, and experience level indicators.
  - Client job posting and management with skill tagging.
  - Freelancer bid submission with connects tracking, estimated days, and cover letters.
  - Client proposal review dashboard with actions: **Shortlist**, **Decline**, and **Accept & Hire**.
- **Simulated Milestone Escrow System**:
  - Double-entry funds ledger using `Wallet` and `Transaction` models.
  - Upon hiring a freelancer, a `Contract` is initiated and escrow is held.
  - Both parties collaborate in a **Contract Room**.
  - Freelancers submit deliverables with text notes and file attachments.
  - Clients approve milestones with a single click, instantly releasing escrow funds to the freelancer's wallet.
- **Contract Workroom & Threaded Messaging**:
  - Live milestone timeline with progress completion percentage.
  - Direct threaded messages between Client and Freelancer inside the contract room with AJAX submission and auto-scroll.
  - Automated system notifications logged when work is submitted or funds are released.
- **Role-Based Dashboards**:
  - **Client Dashboard**: Open jobs, proposal review counter, active contracts, total escrow spent, quick job posting.
  - **Freelancer Dashboard**: Wallet balance, proposal tracker (Pending, Shortlisted, Accepted, Rejected), active workrooms, total earnings.
- **Admin Panel**:
  - Fully configured Django Admin with inlines, search fields, filters, and audit capabilities across all models.
- **Examiner Demo Features**:
  - Includes `populate_data.py` management command with rich sample data.
  - Login page includes one-click demo account autofill buttons for instant evaluation.

---

## 2. Technology Stack

- **Backend**: Python 3.12+ (tested on Python 3.13), Django 5.1.
- **Database**: SQLite (default zero-configuration local setup) or PostgreSQL (configured via environment variables with `psycopg2-binary`).
- **Frontend**: Django Templates, Bootstrap 5.3, Bootstrap Icons, and Vanilla JavaScript.
- **File Storage**: Local Django media storage for avatars, portfolios/resumes, and milestone deliverable uploads.

---

## 3. Project Directory Structure

```
UniWork/
├── UniWork/                     # Project configuration & settings
│   ├── settings.py              # Custom user model, apps, media & static config
│   ├── urls.py                  # Master routing with media serving
│   ├── wsgi.py
│   └── asgi.py
├── accounts/                   # Custom User, ClientProfile, FreelancerProfile, Wallet, Transaction
├── marketplace/                # Categories, Skills, Jobs, Proposals
├── contracts/                  # Contracts, Milestones, Deliverable Submissions, Escrow Release
├── messaging/                  # Threaded chat within contract workrooms
├── dashboard/                  # Client & Freelancer personalized dashboards
├── core/                       # Homepage, About, How It Works, Context Processors
│   └── management/commands/
│       └── populate_data.py    # Database seeder command
├── templates/                  # Modular Bootstrap 5 responsive templates
├── static/                     # Custom CSS and JavaScript
├── media/                      # Uploaded avatars, resumes, deliverable files
├── requirements.txt            # Python dependencies
├── plan.md                     # Architecture plan and file tree
├── manage.py
└── README.md
```

---

## 4. Quickstart & Setup Instructions

Follow these step-by-step instructions to set up and run the application locally:

### Step 1: Clone or Navigate to the Project Directory
```bash
cd c:\Project\UniWork
```

### Step 2: Set Up Virtual Environment
```bash
# Using python venv or uv:
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate

# Or on macOS/Linux:
# source .venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Seed Sample Demo Data
Run the built-in management command to seed categories, skills, sample jobs, contracts, milestones, and pre-configured test users:
```bash
python manage.py populate_data
```

*(Optional) Create your own custom superuser if desired:*
```bash
python manage.py createsuperuser
```

### Step 6: Start the Development Server
```bash
python manage.py runserver
```

Now open your web browser and navigate to:
**http://127.0.0.1:8000/**

---

## 5. Seeded Test Accounts for Grading

The database seeder automatically provides ready-to-test accounts:

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@uniwork.local` | `AdminPass123!` | Full Django Admin access at `/admin/` |
| **Client** | `client.sarah@uniwork.local` | `Password123!` | Stanford Health Lab: Posted healthcare portal job with proposals |
| **Client** | `client.david@uniwork.local` | `Password123!` | EduTech Ventures: Active NLP Contract with pending milestone to approve |
| **Freelancer** | `freelancer.alex@uniwork.local` | `Password123!` | Full-stack Django student developer with pending bids & completed contracts |
| **Freelancer** | `freelancer.priya@uniwork.local` | `Password123!` | ML specialist with active contract #1 and submitted work deliverable |

> **Tip for Grading**: On the **Log In** page (`/accounts/login/`), click any of the **Examiner Demo Autofill** buttons to sign in without typing passwords!

---

## 6. Examiner Walkthrough & User Flows

### Flow A: Client Evaluation Journey
1. Log in as `client.sarah@uniwork.local`.
2. Go to **Dashboard** (`/dashboard/`) to inspect active jobs and spent metrics.
3. Click **Post a Job** (`/jobs/post/`) and submit a new opportunity with skills and budget.
4. Click **Review Proposals** on an open job, inspect applicant bids, and click **Accept & Hire** on a candidate.
5. Notice how a **Contract** is automatically generated, the job status moves to *In Progress*, and you are redirected to the **Contract Room**.

### Flow B: Contract Room & Milestone Escrow Demonstration
1. Log in as `client.david@uniwork.local` and open **Contract #1** (`/contracts/1/`).
2. Notice the milestone timeline: Milestone 1 is already *Approved & Paid* ($200.00). Milestone 2 has a *Work Submission* from student freelancer Priya.
3. Review the freelancer's work submission notes and click **Approve Deliverable & Release $250.00**.
4. Observe the instant simulated escrow release:
   - Milestone turns green (*Approved & Paid*).
   - Contract progress reaches 100% and contract auto-completes.
   - Freelancer's wallet balance is credited.
   - A system transaction is automatically posted to the chat thread and wallet ledger.

### Flow C: Freelancer Evaluation Journey
1. Log in as `freelancer.alex@uniwork.local`.
2. Navigate to **Browse Jobs** (`/jobs/`), filter by category or search "Django".
3. Click on an open job and click **Submit a Proposal**.
4. Enter a bid amount, delivery time, and cover letter, then submit.
5. Visit **Dashboard** (`/dashboard/`) to monitor proposal status.
6. Open **Wallet** (`/accounts/wallet/`) to inspect the simulated balance and audit ledger.

---

## 7. PostgreSQL Configuration (Optional Production Setup)

To use PostgreSQL instead of the default SQLite:
1. Ensure PostgreSQL is running and a database exists (e.g. `uniwork_db`).
2. Set environment variables (or create a `.env` file):
   ```env
   DB_ENGINE=postgresql
   DB_NAME=uniwork_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
3. Run `python manage.py migrate`.

---

## 8. Academic Integrity & Project Information
- **Project Title**: UniWork - University Freelance Marketplace
- **Degree Requirement**: Final Year Computer Science BSc/BEng Project
- **Module**: Advanced Web Application Engineering
