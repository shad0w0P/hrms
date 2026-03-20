# HRMS Lite — Full Stack Application

A Human Resource Management System built with **FastAPI** (Python) + **React** + **SQLite**.

---

## 📁 Project Structure

```
hrms/
├── backend/
│   ├── main.py          # FastAPI routes & API
│   ├── models.py        # Pydantic schemas
│   ├── database.py      # SQLite setup & seed data
│   ├── requirements.txt # Python dependencies
│   └── start.sh         # Backend startup script
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root app, routing, theme, search
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Dashboard with stats & charts
│   │   │   ├── Employees.jsx    # Employee CRUD table
│   │   │   ├── Attendance.jsx   # Attendance grid & marking
│   │   │   ├── Payroll.jsx      # Under construction
│   │   │   └── Reports.jsx      # Under construction
│   │   ├── utils/
│   │   │   └── api.js           # Fetch wrapper
│   │   └── index.css            # Global dark/light theme styles
│   ├── package.json
│   ├── vite.config.js   # Vite + proxy to backend
│   └── start.sh
│
└── start.sh             # Starts both servers at once
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm**

---

### Option A — Start everything at once (recommended)

```bash
cd hrms
chmod +x start.sh
./start.sh
```

This starts both servers and opens:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

---

### Option B — Start separately

**Backend:**
```bash
cd hrms/backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (new terminal):**
```bash
cd hrms/frontend
npm install
npm run dev
```

---

## ✨ Features

### Dashboard
- Total employee count with active/inactive bar visualization
- Department breakdown donut chart (Recharts)
- Performance report with period toggle (This Month / Year / All Time)
  - Top performers by attendance
  - Top absentees
  - Attendance rate by department
- Attendance summary with rate indicator

### Employees
- Full employee table with pagination (20/page)
- Search by name, email, or designation
- Filter by department
- **Add Employee** modal form
- **Edit Employee** inline
- **Delete Employee** with confirmation
- Department color-coded tags

### Attendance
- Date range selector (max 7 days)
- Per-employee, per-day attendance grid
- **Click any cell to change status**: Present / Absent / Late / Holiday / Unmarked
- Attendance rate + summary breakdown
- Search employees in the grid

### Global
- **Dark / Light mode** toggle (sidebar)
- **Ctrl+K search** — search employees from anywhere
- Toast notifications for all actions
- Fully responsive layout

---

## 🗄️ Database

SQLite file is created at `backend/hrms.db` on first run.

**Tables:**
- `employees` — 42 seeded employees across 10 departments
- `attendance` — per-employee per-day records

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Overview stats + dept breakdown |
| GET | `/api/dashboard/performance?period=month` | Performance data |
| GET | `/api/employees` | List employees (search, dept filter, pagination) |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/attendance` | Get attendance grid |
| PUT | `/api/attendance/{emp_id}/{date}` | Update attendance record |

Full interactive docs at **http://localhost:8000/docs**

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Uvicorn, Pydantic v2 |
| Database | SQLite (via Python `sqlite3`) |
| Frontend | React 18, React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Build | Vite 5 |

---

## 🛠️ Extending

**Add Payroll:** Edit `backend/main.py` to add `/api/payroll` routes and update `frontend/src/pages/Payroll.jsx`.

**Add Reports:** Same pattern — add routes + update the Reports page.

**Switch to PostgreSQL:** Replace `sqlite3` in `database.py` with `asyncpg` or `psycopg2` and update the connection string.
