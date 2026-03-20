from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import sqlite3
import os
from datetime import datetime, date, timedelta
from contextlib import contextmanager

from models import (
    Employee, EmployeeCreate, EmployeeUpdate,
    AttendanceRecord, AttendanceUpdate,
    DashboardStats, DepartmentStat
)
from database import init_db, get_db

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hrms-atul.netlify.app",  "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# ─── DASHBOARD ───────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    with get_db() as db:
        cur = db.cursor()

        cur.execute("SELECT COUNT(*) FROM employees")
        total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM employees WHERE status = 'Active'")
        active = cur.fetchone()[0]

        cur.execute("""
            SELECT department, COUNT(*) as count
            FROM employees GROUP BY department ORDER BY count DESC
        """)
        dept_rows = cur.fetchall()
        dept_stats = [{"department": r[0], "count": r[1], "percentage": round(r[1]/total*100) if total else 0} for r in dept_rows]

        return {
            "total_employees": total,
            "active_employees": active,
            "inactive_employees": total - active,
            "active_percentage": round(active/total*100) if total else 0,
            "department_stats": dept_stats
        }

@app.get("/api/dashboard/performance")
def get_performance(period: str = "month"):
    with get_db() as db:
        cur = db.cursor()
        if period == "month":
            since = (date.today().replace(day=1)).isoformat()
        elif period == "year":
            since = date.today().replace(month=1, day=1).isoformat()
        else:
            since = "2000-01-01"

        cur.execute("""
            SELECT e.id, e.name, e.department, e.designation,
                   COUNT(CASE WHEN a.status='Present' THEN 1 END) as present_days,
                   COUNT(a.id) as total_days
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.date >= ?
            WHERE e.status = 'Active'
            GROUP BY e.id HAVING total_days > 0
            ORDER BY present_days DESC LIMIT 5
        """, (since,))
        top_performers = [dict(zip([d[0] for d in cur.description], r)) for r in cur.fetchall()]

        cur.execute("""
            SELECT e.id, e.name, e.department, e.designation,
                   COUNT(CASE WHEN a.status='Absent' THEN 1 END) as absent_days
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.date >= ?
            WHERE e.status = 'Active'
            GROUP BY e.id HAVING absent_days > 0
            ORDER BY absent_days DESC LIMIT 5
        """, (since,))
        top_absentees = [dict(zip([d[0] for d in cur.description], r)) for r in cur.fetchall()]

        cur.execute("""
            SELECT e.department,
                   COUNT(CASE WHEN a.status='Present' THEN 1 END) as present,
                   COUNT(a.id) as total
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.date >= ?
            GROUP BY e.department
        """, (since,))
        by_dept = []
        for r in cur.fetchall():
            dept, present, total = r
            rate = round(present/total*100) if total else 0
            by_dept.append({"department": dept, "rate": rate})

        return {"top_performers": top_performers, "top_absentees": top_absentees, "by_department": by_dept}

# ─── EMPLOYEES ───────────────────────────────────────────────────────────────

@app.get("/api/employees")
def list_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    with get_db() as db:
        cur = db.cursor()
        query = "SELECT * FROM employees WHERE 1=1"
        params = []
        if search:
            query += " AND (name LIKE ? OR email LIKE ? OR designation LIKE ?)"
            params += [f"%{search}%", f"%{search}%", f"%{search}%"]
        if department and department != "All Departments":
            query += " AND department = ?"
            params.append(department)
        if status:
            query += " AND status = ?"
            params.append(status)

        cur.execute(f"SELECT COUNT(*) FROM ({query})", params)
        total = cur.fetchone()[0]

        query += f" ORDER BY emp_id LIMIT {limit} OFFSET {(page-1)*limit}"
        cur.execute(query, params)
        cols = [d[0] for d in cur.description]
        employees = [dict(zip(cols, r)) for r in cur.fetchall()]

        return {"employees": employees, "total": total, "page": page, "pages": -(-total // limit)}

@app.get("/api/employees/departments")
def get_departments():
    with get_db() as db:
        cur = db.cursor()
        cur.execute("SELECT DISTINCT department FROM employees ORDER BY department")
        return [r[0] for r in cur.fetchall()]

@app.get("/api/employees/{emp_id}")
def get_employee(emp_id: int):
    with get_db() as db:
        cur = db.cursor()
        cur.execute("SELECT * FROM employees WHERE id = ?", (emp_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Employee not found")
        return dict(zip([d[0] for d in cur.description], row))

@app.post("/api/employees", status_code=201)
def create_employee(emp: EmployeeCreate):
    with get_db() as db:
        cur = db.cursor()
        cur.execute("SELECT MAX(CAST(SUBSTR(emp_id,2) AS INT)) FROM employees")
        max_id = cur.fetchone()[0] or 999
        new_emp_id = f"#{max_id + 1}"
        cur.execute("""
            INSERT INTO employees (emp_id, name, email, department, designation, status, phone, join_date, avatar_initials)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, (
            new_emp_id, emp.name, emp.email, emp.department,
            emp.designation, emp.status, emp.phone,
            emp.join_date or date.today().isoformat(),
            "".join([w[0].upper() for w in emp.name.split()[:2]])
        ))
        db.commit()
        return {"id": cur.lastrowid, "emp_id": new_emp_id, "message": "Employee created"}

@app.put("/api/employees/{emp_id}")
def update_employee(emp_id: int, emp: EmployeeUpdate):
    with get_db() as db:
        cur = db.cursor()
        fields = {k: v for k, v in emp.dict().items() if v is not None}
        if not fields:
            raise HTTPException(400, "No fields to update")
        set_clause = ", ".join(f"{k}=?" for k in fields)
        cur.execute(f"UPDATE employees SET {set_clause} WHERE id=?", list(fields.values()) + [emp_id])
        db.commit()
        return {"message": "Updated"}

@app.delete("/api/employees/{emp_id}")
def delete_employee(emp_id: int):
    with get_db() as db:
        cur = db.cursor()
        cur.execute("DELETE FROM employees WHERE id=?", (emp_id,))
        db.commit()
        return {"message": "Deleted"}

# ─── ATTENDANCE ──────────────────────────────────────────────────────────────

@app.get("/api/attendance")
def get_attendance(
    date_from: str = Query(default=None),
    date_to: str = Query(default=None),
    search: Optional[str] = None
):
    if not date_from:
        date_from = (date.today() - timedelta(days=6)).isoformat()
    if not date_to:
        date_to = date.today().isoformat()

    with get_db() as db:
        cur = db.cursor()

        # Build date range
        start = datetime.strptime(date_from, "%Y-%m-%d").date()
        end = datetime.strptime(date_to, "%Y-%m-%d").date()
        delta = (end - start).days + 1
        date_range = [(start + timedelta(days=i)).isoformat() for i in range(delta)]

        query = "SELECT * FROM employees WHERE 1=1"
        params = []
        if search:
            query += " AND name LIKE ?"
            params.append(f"%{search}%")

        cur.execute(query, params)
        cols = [d[0] for d in cur.description]
        employees = [dict(zip(cols, r)) for r in cur.fetchall()]

        # Get attendance records
        cur.execute("""
            SELECT employee_id, date, status, check_in, check_out
            FROM attendance WHERE date BETWEEN ? AND ?
        """, (date_from, date_to))
        att_rows = cur.fetchall()
        att_map = {}
        for row in att_rows:
            att_map[(row[0], row[1])] = {"status": row[2], "check_in": row[3], "check_out": row[4]}

        # Enrich employees with attendance
        result = []
        for emp in employees:
            attendance = {}
            for d in date_range:
                key = (emp["id"], d)
                attendance[d] = att_map.get(key, {"status": "Unmarked"})
            result.append({**emp, "attendance": attendance})

        # Summary
        all_records = [v for emp in result for v in emp["attendance"].values()]
        total = len(all_records)
        present = sum(1 for r in all_records if r["status"] == "Present")
        on_time = sum(1 for r in all_records if r["status"] == "Present")
        late = sum(1 for r in all_records if r["status"] == "Late")
        absent = sum(1 for r in all_records if r["status"] == "Absent")
        holiday = sum(1 for r in all_records if r["status"] == "Holiday")
        unmarked = sum(1 for r in all_records if r["status"] == "Unmarked")

        return {
            "employees": result,
            "date_range": date_range,
            "summary": {
                "present": present,
                "on_time": on_time,
                "late": late,
                "absent": absent,
                "holiday": holiday,
                "unmarked": unmarked,
                "total": len(employees),
                "attendance_rate": round(present / (len(employees) * delta) * 100) if employees and delta else 0
            }
        }

@app.put("/api/attendance/{employee_id}/{att_date}")
def update_attendance(employee_id: int, att_date: str, data: AttendanceUpdate):
    with get_db() as db:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO attendance (employee_id, date, status, check_in, check_out)
            VALUES (?,?,?,?,?)
            ON CONFLICT(employee_id, date) DO UPDATE SET
                status=excluded.status, check_in=excluded.check_in, check_out=excluded.check_out
        """, (employee_id, att_date, data.status, data.check_in, data.check_out))
        db.commit()
        return {"message": "Attendance updated"}
