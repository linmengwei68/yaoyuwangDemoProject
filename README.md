# PartnerHub

A full-stack job recruitment platform built with **Next.js 16**, **NestJS 11**, and **PostgreSQL**. Supports three user roles — **Applicant**, **Project Owner**, and **Admin** — with complete workflows for posting jobs, applying, reviewing applications, role-based access control, and real-time notifications.

> **Demo Project** — Built to demonstrate full-stack development capabilities including architecture design, role-based access control, real-time notification system, and production-ready code practices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Ant Design 6, Tailwind CSS 4, Zustand |
| **Backend** | NestJS 11, Prisma 5, Passport JWT, bcrypt |
| **Database** | PostgreSQL (local portable / Neon cloud) |
| **i18n** | English, French |

---

## Features

### Applicant
- Browse and search all active job posts
- Collect (favorite) job posts
- Apply to jobs with custom question forms + file upload (resume, portfolio)
- Auto-fill personal info from saved profile
- Track application status (applied → reviewed / rejected)
- Receive notifications on status changes
- Country / State cascading selection

### Project Owner
- Create job posts from scratch or import from templates
- Manage reusable job post templates
- View applications sorted by unreviewed count (priority)
- Review / reject applications with one click
- Red badge indicator for posts with pending applications
- Receive notifications when new applications arrive

### Admin
- User management (CRUD with audit trail)
- Role & permission management
- Dictionary management (countries, states, configuration)
- Full audit trail logging for all changes

### System
- JWT authentication with session management
- Role-based navigation & page access
- Notification system (bell icon, unread count, mark as reviewed)
- Responsive data tables with search, filter, sort, pagination
- File upload with UUID-based naming
- Draft auto-save for job post creation
- Cross-page navigation with highlight & scroll-to-target
- **Interactive guided tour** (Ant Design Tour) — auto-shows on first visit for each section, role-aware steps
- **Help documentation** — paginated 8-page in-app manual covering all features, accessible from the nav bar
- **i18n** — Full English & French support including all tour steps and help pages

---

## Project Structure

```
PartnerHub/
├── frontend/                    # Next.js 16 (App Router)
│   ├── app/                     # Pages
│   │   ├── login/               # Authentication
│   │   ├── admin/               # Admin: users, roles, permissions, dictionary
│   │   ├── applicant/           # Applicant profile
│   │   ├── template/            # Job post templates
│   │   ├── post/                # Job post creation & detail
│   │   └── application/         # Application review detail
│   ├── components/              # Shared components
│   │   ├── home/                # Role-based home views (with Tour)
│   │   ├── layout/              # Navigation, menu, breadcrumb (Help modal, Guide)
│   │   └── table/               # Reusable data table
│   ├── api/                     # API client functions
│   └── lib/                     # Utilities, i18n, state, interceptors
│
├── backend/                     # NestJS 11
│   ├── src/
│   │   ├── auth/                # JWT authentication
│   │   ├── users/               # User management
│   │   ├── roles/               # Role management
│   │   ├── permissions/         # Permission management
│   │   ├── job-post/            # Job post CRUD & sorting
│   │   ├── job-post-template/   # Template CRUD
│   │   ├── application/         # Application management
│   │   ├── applicant-info/      # Applicant profile
│   │   ├── notification/        # Notification system
│   │   ├── dictionary/          # Config dictionary
│   │   ├── audit-trail/         # Change logging
│   │   ├── upload/              # File upload
│   │   └── prisma/              # Database service
│   └── prisma/
│       ├── schema.prisma        # Database schema (10 models)
│       ├── seed.mjs             # Roles, permissions, dictionary seed
│       └── migrations/          # 21 migration files
│
├── start.ps1                    # One-click start (PostgreSQL + Backend + Frontend)
└── stop.ps1                     # One-click stop all services
```

---

## Database Schema

```
User ──< JobPost ──< Application >── User (applicant)
  │         │
  │         └── questions (JSON)
  │
  ├──< JobPostTemplate
  ├──< Notification
  ├──1 ApplicantInformation
  ├──< AuditTrail
  └──<> Role ──<> Permission

Dictionary (key-value configuration)
```

**10 models**: User, Role, Permission, Dictionary, AuditTrail, JobPostTemplate, JobPost, ApplicantInformation, Application, Notification

**Enums**: `JobPostState` (active, closed) · `ApplicationState` (applied, reviewed, rejected)

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** 15+ (or use the portable version included in `.postgres/`)

### 1. Clone & Install

```bash
git clone https://github.com/linmengwei68/yaoyuwangDemoProject.git
cd yaoyuwangDemoProject
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env if using a different database
```

Default configuration (works out of the box with local PostgreSQL):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/partnerhub"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Start Development

**Option A — One-click (Windows PowerShell):**

```powershell
.\start.ps1    # Starts PostgreSQL + Backend + Frontend
.\stop.ps1     # Stops all services
```

**Option B — Manual:**

```bash
# Terminal 1: Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2: Frontend (port 3000)
cd frontend && npm run dev
```

### 5. Open in Browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## Default Accounts

After running `npx prisma db seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@partnerhub.com | admin123 |

You can register new Applicant or Project Owner accounts from the login page.

---

## API Overview

| Module | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/login` · `POST /api/auth/register` · `POST /api/auth/refresh` · `GET /api/auth/me` |
| **Users** | `GET /api/users` · `POST /api/users` · `PUT /api/users/:id` · `DELETE /api/users/:id` |
| **Roles** | `GET /api/roles` · `POST /api/roles` · `PUT /api/roles/:id` · `DELETE /api/roles/:id` |
| **Permissions** | `GET /api/permissions` · `POST /api/permissions` · `PUT /api/permissions/:id` · `DELETE /api/permissions/:id` |
| **Job Posts** | `GET /api/job-posts` · `POST /api/job-posts` · `PATCH /api/job-posts/:id` · `DELETE /api/job-posts/:id` |
| **Templates** | `GET /api/job-post-templates` · `POST /api/job-post-templates` · `PUT /api/job-post-templates/:id` |
| **Applications** | `POST /api/applications` · `GET /api/applications/mine` · `PATCH /api/applications/:id/state` |
| **Notifications** | `GET /api/notifications` · `PATCH /api/notifications/:id/reviewed` · `PATCH /api/notifications/reviewed-all` |
| **Dictionary** | `GET /api/dictionary` · `POST /api/dictionary` · `PUT /api/dictionary/:id` · `DELETE /api/dictionary/:id` |
| **Upload** | `POST /api/upload` · `GET /api/upload/:filename` |
| **Audit Trail** | `GET /api/audit-trail` |

---

## Key Design Decisions

1. **Monorepo structure** — Frontend and backend in one repository for easy development and deployment
2. **Portable PostgreSQL** — Included in `.postgres/` for zero-config local development
3. **JSON fields for flexible schemas** — Job post questions and application answers stored as JSON to support dynamic form fields
4. **In-memory sorting for applied count** — Job posts sorted by unreviewed application count using application-layer logic rather than complex SQL
5. **Ref-based URL cleanup** — Filter parameters captured on mount and immediately removed from URL for clean navigation
6. **Draft auto-save** — Job post creation form saves to sessionStorage on every change
7. **Role-aware guided tours** — Each role (Applicant, Owner, Admin) gets a tailored interactive tour using Ant Design `<Tour />`, triggered once per section via localStorage. The Guide button resets all tours; clicking it on admin pages stays on the current admin page
8. **In-app help documentation** — 8-page paginated modal with full feature documentation, powered by i18n so content adapts to the selected language
9. **RBAC permission flow** — Permissions → Roles → Users chain; DataTable columns use `accessCode` to gate inline editing; admin tour explains the complete permission lifecycle

---

## Interactive Tour & Help

### Guided Tour (Guide button)
The app includes role-based interactive walkthroughs using Ant Design's `<Tour />` component:

| Section | Steps | Trigger |
|---|---|---|
| **Login page** | 3 steps — tabs, form overview, role selection | Auto on first visit |
| **Applicant home** | 4 steps — tabs, search, cards, detail panel | Auto on first visit |
| **Owner home** | 3 steps — table, templates, create post | Auto on first visit |
| **Admin sidebar** | 6 steps — RBAC overview, Users, Roles, Permissions, Dictionary, Audit Trail | Auto on first admin page visit |

Tours are stored in `localStorage` and only show once. Click the **Guide** button in the nav bar to reset and replay all tours.

### Help Documentation (Help button)
A paginated 8-page manual accessible from the nav bar covers:
1. Overview & roles
2. Authentication & registration
3. Applicant features
4. Project Owner features
5. Admin — Users
6. Admin — Roles & Permissions (RBAC flow)
7. Admin — Dictionary & Audit Trail
8. Notifications & Navigation

All content is fully translated (EN / FR).

---

## Screenshots

*Coming soon*

---

## License

This project is for demonstration purposes.
