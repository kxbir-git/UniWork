# UniWork Freelancing Marketplace - Implementation Plan

## 1. Project Overview & Architecture
UniWork is a production-ready university freelancing marketplace platform connecting student/alumni freelancers with project clients.
- **Framework**: Django 5.1 (Python 3.12+)
- **Architecture**: Modular Django Apps (`accounts`, `marketplace`, `contracts`, `messaging`, `dashboard`, `core`)
- **Database**: SQLite (default local) / PostgreSQL support via `psycopg2-binary`
- **Frontend**: Django Templates + Bootstrap 5 + Bootstrap Icons + Vanilla JS
- **Payment Ledger**: Simulated Escrow & Wallet system with transaction logging
- **Storage**: Media handling for user avatars, resumes/portfolios, and milestone work deliverables

---

## 2. Directory & File Structure
```
UniWork/
├── UniWork/                     # Project root / settings
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/                   # Authentication & Profiles
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── forms.py
│   ├── models.py               # User (AbstractUser), ClientProfile, FreelancerProfile, Wallet, Transaction
│   ├── urls.py
│   └── views.py
├── marketplace/                # Jobs, Skills, Categories, Proposals
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── forms.py
│   ├── models.py               # Category, Skill, Job, Proposal
│   ├── urls.py
│   └── views.py
├── contracts/                  # Contracts, Milestones, Escrow & Work Submissions
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── forms.py
│   ├── models.py               # Contract, Milestone, WorkSubmission
│   ├── urls.py
│   └── views.py
├── messaging/                  # Contract-scoped Threaded Chat
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py               # Message
│   ├── urls.py
│   └── views.py
├── dashboard/                  # Role-based Dashboards (Client & Freelancer)
│   ├── migrations/
│   ├── __init__.py
│   ├── apps.py
│   ├── urls.py
│   └── views.py
├── core/                       # Homepage, Search, Static informational views
│   ├── management/
│   │   └── commands/
│   │       ├── __init__.py
│   │       └── populate_data.py # Sample database seed command
│   ├── migrations/
│   ├── __init__.py
│   ├── apps.py
│   ├── urls.py
│   └── views.py
├── static/
│   ├── css/
│   │   └── style.css           # Custom theme overrides and polishing
│   └── js/
│       └── main.js             # Interactive client-side helpers
├── media/                      # Uploaded files
│   ├── avatars/
│   ├── portfolios/
│   └── submissions/
├── templates/
│   ├── base.html
│   ├── navbar.html
│   ├── footer.html
│   ├── 404.html
│   ├── 500.html
│   ├── core/
│   │   ├── index.html
│   │   ├── about.html
│   │   └── how_it_works.html
│   ├── accounts/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── profile_edit.html
│   │   ├── freelancer_detail.html
│   │   └── client_detail.html
│   ├── marketplace/
│   │   ├── job_list.html
│   │   ├── job_detail.html
│   │   ├── job_form.html
│   │   ├── proposal_form.html
│   │   └── job_proposals.html
│   ├── contracts/
│   │   ├── contract_list.html
│   │   ├── contract_room.html
│   │   └── milestone_form.html
│   ├── dashboard/
│   │   ├── client_dashboard.html
│   │   └── freelancer_dashboard.html
│   └── messaging/
│       └── chat_thread.html
├── requirements.txt
├── README.md
├── plan.md
└── manage.py
```

---

## 3. Implementation Order

1. **Project Scaffolding & Settings**:
   - Initialize Django project `UniWork` and register apps: `accounts`, `marketplace`, `contracts`, `messaging`, `dashboard`, `core`.
   - Configure custom user model `AUTH_USER_MODEL = 'accounts.User'`.
   - Setup static and media file directories, bootstrap assets, template context processors.
2. **Models & Migrations**:
   - `accounts`: `User` (email unique, is_client, is_freelancer), `ClientProfile`, `FreelancerProfile`, `Wallet`, `Transaction`.
   - `marketplace`: `Category`, `Skill`, `Job`, `Proposal`.
   - `contracts`: `Contract`, `Milestone`, `WorkSubmission`.
   - `messaging`: `Message`.
   - Generate initial migrations and run `python manage.py migrate`.
3. **Admin Configuration**:
   - Register all models in Django Admin with filters, search fields, and inline tables for seamless grading and administration.
4. **Forms, Permissions & Business Logic**:
   - Custom registration forms allowing selection of Client vs Freelancer role with automatic profile & wallet creation.
   - Role-based mixins (`ClientRequiredMixin`, `FreelancerRequiredMixin`).
   - Escrow & milestone funding/approval workflows in service methods.
5. **Views & Templates**:
   - Global Base layout with responsive Bootstrap 5 navbar, hero banner, toast messages, and dynamic navigation links based on user role.
   - Core views: Landing page featuring search bar, categories, top jobs, stats; About & How It Works.
   - Marketplace views: Search & filter jobs (fixed/hourly, category, status), job detail, post a job (client), submit proposal (freelancer, checks proposal limit/connects), review proposals and accept proposal.
   - Contract Room: Contract details, milestone timeline, work submission modal/form, client approval action (which credits freelancer wallet and records transaction), embedded real-time-like threaded messaging.
   - Role-based Dashboards: Tailored views for clients (spent, active jobs, proposals received) and freelancers (earnings, active jobs, proposals status, wallet).
6. **Data Seeder (`populate_data.py`)**:
   - Create categories (Web Dev, AI & Data Science, Mobile Dev, Design & UI/UX, Content Writing, Tutoring & Academics).
   - Create skills.
   - Create dummy clients and freelancers with pre-filled profiles, wallets, jobs, proposals, contracts, and milestones.
   - Create default admin superuser (`admin@uniwork.local` / `AdminPass123!`).
7. **Testing, Verification & Deliverables**:
   - Run tests & verify server boot (`python manage.py runserver`).
   - Verify HTTP responses (200 OK for Homepage, Login, Jobs, Dashboard).
   - Provide comprehensive `README.md` and `requirements.txt`.
