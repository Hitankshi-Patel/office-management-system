# Office Management System

A full-stack office management system built with **Python/FastAPI/PostgreSQL** (backend) and **React/Vite** (frontend).

## Roles
| Role | Capabilities |
|---|---|
| **Owner** | Add HR & employees, create & assign projects |
| **HR** | Add employees, view all attendance, manage tickets & leaves |
| **Employee** | Clock in/out, submit tickets & leave requests |

---

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL (running locally)
- Node.js 18+

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure database
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# Seed the owner account
python seed.py

# Start the server
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

**Default Login Credentials:**
| Role | Email | Password |
|---|---|---|
| **Owner** | `owner@office.com` | `owner123` |
| **HR** | `dhruvin@office.com` | `dhruv123` |
| **Employee** | `hitankshi@office.com` | `hitu123` |

*(The seed script also creates a default project, an attendance log, a support ticket, and a leave request for testing.)*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## API Endpoints (v1)

All endpoints prefixed with `/api/v1/`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Get current user |
| POST | `/users/` | Create user (owner/hr) |
| GET | `/users/` | List all users (owner/hr) |
| PUT | `/users/{id}` | Update user (owner) |
| DELETE | `/users/{id}` | Deactivate user (owner) |
| POST | `/projects/` | Create project (owner) |
| GET | `/projects/` | List projects |
| POST | `/projects/{id}/assign` | Assign employee (owner) |
| POST | `/attendance/clock-in` | Clock in (employee) |
| POST | `/attendance/clock-out` | Clock out (employee) |
| GET | `/attendance/` | All records (hr/owner) |
| GET | `/attendance/summary` | Pay summary (hr/owner) |
| POST | `/tickets/` | Create ticket (employee) |
| PATCH | `/tickets/{id}/resolve` | Resolve ticket (hr/owner) |
| POST | `/leaves/` | Apply for leave (employee) |
| PATCH | `/leaves/{id}/review` | Approve/Reject leave (hr/owner) |

---

## Project Structure

```
Office Management System/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/          # DB models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   └── core/            # Security & deps
│   ├── seed.py              # Owner seed script
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/             # Axios client
        ├── context/         # Auth context
        ├── components/      # Sidebar, Layout, ProtectedRoute
        └── pages/           # owner/, hr/, employee/
```
