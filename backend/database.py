import sqlite3
import os
from contextlib import contextmanager
from datetime import date, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "hrms.db")

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                department TEXT NOT NULL,
                designation TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Active',
                phone TEXT,
                join_date TEXT,
                avatar_initials TEXT
            );

            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Unmarked',
                check_in TEXT,
                check_out TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                UNIQUE(employee_id, date)
            );
        """)

        # Seed if empty
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM employees")
        if cur.fetchone()[0] == 0:
            seed_data(conn)

def seed_data(conn):
    departments = [
        ("Engineering", 17),
        ("Operations", 10),
        ("Sales", 10),
        ("Product", 10),
        ("Design", 10),
        ("Marketing", 10),
        ("Finance", 10),
        ("Human Resources", 10),
        ("Customer Support", 10),
        ("Legal", 7),
    ]

    employees = [
    ("#2000", "Aarav Sharma", "aarav.sharma@company.com", "Engineering", "Backend Engineer", "Active"),
    ("#2001", "Isha Verma", "isha.verma@company.com", "Marketing", "SEO Specialist", "Active"),
    ("#2002", "Rohit Kulkarni", "rohit.k@company.com", "Finance", "Financial Analyst", "Active"),
    ("#2003", "Sneha Reddy", "sneha.reddy@company.com", "Human Resources", "HR Executive", "Active"),
    ("#2004", "Kabir Mehta", "kabir.mehta@company.com", "Product", "Product Owner", "Inactive"),
    ("#2005", "Anjali Nair", "anjali.nair@company.com", "Design", "UX Designer", "Active"),
    ("#2006", "Vivek Singh", "vivek.singh@company.com", "Engineering", "DevOps Engineer", "Active"),
    ("#2007", "Pooja Iyer", "pooja.iyer@company.com", "Customer Support", "Support Specialist", "Active"),
    ("#2008", "Rahul Kapoor", "rahul.kapoor@company.com", "Sales", "Sales Executive", "Active"),
    ("#2009", "Neeraj Patel", "neeraj.patel@company.com", "Operations", "Operations Manager", "Inactive"),
    ("#2010", "Megha Joshi", "megha.joshi@company.com", "Engineering", "Frontend Developer", "Active"),
    ("#2011", "Aditya Chauhan", "aditya.chauhan@company.com", "Legal", "Legal Advisor", "Active"),
    ("#2012", "Ritika Shah", "ritika.shah@company.com", "Finance", "Accountant", "Active"),
    ("#2013", "Karan Malhotra", "karan.m@company.com", "Product", "Product Analyst", "Active"),
    ("#2014", "Divya Menon", "divya.menon@company.com", "Marketing", "Content Writer", "Active"),
    ("#2041", "Tarun Saxena", "tarun.s@company.com", "Engineering", "System Architect", "Inactive"),
]

    cur = conn.cursor()
    for emp in employees:
        emp_id, name, email, dept, desig, status = emp
        initials = "".join([w[0].upper() for w in name.split()[:2]])
        cur.execute("""
            INSERT OR IGNORE INTO employees (emp_id, name, email, department, designation, status, join_date, avatar_initials)
            VALUES (?,?,?,?,?,?,?,?)
        """, (emp_id, name, email, dept, desig, status, "2022-01-15", initials))

    conn.commit()
