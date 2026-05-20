from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, timezone

from app.database import get_db
from app.models.attendance import Attendance
from app.models.user import User, UserRole
from app.schemas.attendance import AttendanceResponse, AttendanceSummary
from app.core.deps import get_current_user, require_hr_or_owner, require_employee

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/clock-in", response_model=AttendanceResponse)
def clock_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already clocked in today")

    record = Attendance(
        employee_id=current_user.id,
        date=today,
        clock_in=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/clock-out", response_model=AttendanceResponse)
def clock_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    today = date.today()
    record = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today,
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="You have not clocked in today")
    if record.clock_out:
        raise HTTPException(status_code=400, detail="Already clocked out today")

    now = datetime.now(timezone.utc)
    record.clock_out = now
    clock_in_aware = record.clock_in.replace(tzinfo=timezone.utc) if record.clock_in.tzinfo is None else record.clock_in
    duration = (now - clock_in_aware).total_seconds() / 3600
    record.hours_worked = round(duration, 2)
    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=List[AttendanceResponse])
def my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Attendance).filter(
        Attendance.employee_id == current_user.id
    ).order_by(Attendance.date.desc()).all()


@router.get("/", response_model=List[AttendanceResponse])
def all_attendance(
    employee_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_owner),
):
    query = db.query(Attendance)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    return query.order_by(Attendance.date.desc()).all()


@router.get("/summary", response_model=List[AttendanceSummary])
def attendance_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_owner),
):
    """Total hours and estimated pay per employee."""
    employees = db.query(User).filter(User.role == UserRole.employee, User.is_active == True).all()
    result = []
    for emp in employees:
        records = db.query(Attendance).filter(Attendance.employee_id == emp.id).all()
        total_hours = sum(r.hours_worked or 0 for r in records)
        result.append(AttendanceSummary(
            employee_id=emp.id,
            employee_name=emp.name,
            total_hours=round(total_hours, 2),
            estimated_pay=round(total_hours * emp.hourly_rate, 2),
        ))
    return result
