from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import date

class EmployeeCreate(BaseModel):
    name: str
    email: str
    department: str
    designation: str
    status: str = "Active"
    phone: Optional[str] = None
    join_date: Optional[str] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None

class Employee(BaseModel):
    id: int
    emp_id: str
    name: str
    email: str
    department: str
    designation: str
    status: str
    phone: Optional[str]
    join_date: Optional[str]
    avatar_initials: str

class AttendanceUpdate(BaseModel):
    status: str  # Present, Absent, Late, Holiday, Unmarked
    check_in: Optional[str] = None
    check_out: Optional[str] = None

class AttendanceRecord(BaseModel):
    employee_id: int
    date: str
    status: str
    check_in: Optional[str]
    check_out: Optional[str]

class DepartmentStat(BaseModel):
    department: str
    count: int
    percentage: float

class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    active_percentage: float
    department_stats: List[DepartmentStat]
