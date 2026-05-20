"""
Seed script — creates the default owner account, HR, Employee, Project, and some dummy data.
Run once after setting up the database:
  python seed.py
"""
import sys
import os
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
import app.models  # noqa: F401 — registers all models

from app.models.user import User, UserRole
from app.models.project import Project, ProjectAssignment
from app.models.attendance import Attendance
from app.models.ticket import Ticket, TicketStatus
from app.models.leave import Leave, LeaveStatus
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # 1. Create Owner
        owner = db.query(User).filter(User.email == "owner@office.com").first()
        if not owner:
            owner = User(
                name="Office Owner",
                email="owner@office.com",
                password_hash=hash_password("owner123"),
                role=UserRole.owner,
                hourly_rate=0.0,
                is_active=True,
            )
            db.add(owner)
            db.commit()
            print("[seed] Owner created: owner@office.com")

        # 2. Create HR
        hr = db.query(User).filter(User.email == "dhruvin@office.com").first()
        if not hr:
            hr = User(
                name="Dhruvin Virani",
                email="dhruvin@office.com",
                password_hash=hash_password("dhruv123"),
                role=UserRole.hr,
                hourly_rate=250.0,
                is_active=True,
            )
            db.add(hr)
            db.commit()
            print("[seed] HR created: dhruvin@office.com")

        # 3. Create Employee
        employee = db.query(User).filter(User.email == "hitankshi@office.com").first()
        if not employee:
            employee = User(
                name="Hitankshi Patel",
                email="hitankshi@office.com",
                password_hash=hash_password("hitu123"),
                role=UserRole.employee,
                hourly_rate=500.0,
                is_active=True,
            )
            db.add(employee)
            db.commit()
            print("[seed] Employee created: hitankshi@office.com")

        owner_id = db.query(User).filter(User.email == "owner@office.com").first().id
        emp_id = db.query(User).filter(User.email == "hitankshi@office.com").first().id

        # 4. Create Project
        project = db.query(Project).filter(Project.name == "Office Management App Migration").first()
        if not project:
            project = Project(
                name="Office Management App Migration",
                description="Migrating the entire office management system from old servers to AWS.",
                created_by=owner_id
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            
            # Assign employee to project
            assignment = ProjectAssignment(project_id=project.id, employee_id=emp_id)
            db.add(assignment)
            db.commit()
            print("[seed] Project created and assigned.")

        # 5. Create Attendance for Employee (Yesterday)
        yesterday = date.today() - timedelta(days=1)
        attendance = db.query(Attendance).filter(Attendance.employee_id == emp_id, Attendance.date == yesterday).first()
        if not attendance:
            clock_in = datetime.now(timezone.utc) - timedelta(days=1, hours=8)
            clock_out = datetime.now(timezone.utc) - timedelta(days=1)
            att = Attendance(
                employee_id=emp_id,
                date=yesterday,
                clock_in=clock_in,
                clock_out=clock_out,
                hours_worked=8.0
            )
            db.add(att)
            db.commit()
            print("[seed] Attendance logged for yesterday.")

        # 6. Create Support Ticket
        ticket = db.query(Ticket).filter(Ticket.employee_id == emp_id).first()
        if not ticket:
            tick = Ticket(
                employee_id=emp_id,
                title="VPN Connection Issue",
                description="I cannot connect to the office VPN. It keeps disconnecting after 5 minutes.",
                status=TicketStatus.open
            )
            db.add(tick)
            db.commit()
            print("[seed] Support ticket created.")

        # 7. Create Leave Request
        leave = db.query(Leave).filter(Leave.employee_id == emp_id).first()
        if not leave:
            lv = Leave(
                employee_id=emp_id,
                start_date=date.today() + timedelta(days=5),
                end_date=date.today() + timedelta(days=7),
                reason="Attending a family wedding out of town.",
                status=LeaveStatus.pending
            )
            db.add(lv)
            db.commit()
            print("[seed] Leave request created.")

        print("[seed] Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
