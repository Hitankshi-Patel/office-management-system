from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.leave import Leave, LeaveStatus
from app.models.user import User, UserRole
from app.schemas.leave import LeaveCreate, LeaveReview, LeaveResponse
from app.core.deps import get_current_user, require_hr_or_owner, require_employee

router = APIRouter(prefix="/leaves", tags=["Leave Requests"])


@router.post("/", response_model=LeaveResponse, status_code=201)
def apply_leave(
    payload: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    leave = Leave(
        employee_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/", response_model=List[LeaveResponse])
def list_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.employee:
        return db.query(Leave).filter(Leave.employee_id == current_user.id).order_by(Leave.created_at.desc()).all()
    return db.query(Leave).order_by(Leave.created_at.desc()).all()


@router.get("/{leave_id}", response_model=LeaveResponse)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if current_user.role == UserRole.employee and leave.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your leave request")
    return leave


@router.patch("/{leave_id}/review", response_model=LeaveResponse)
def review_leave(
    leave_id: int,
    payload: LeaveReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_owner),
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Leave already reviewed")
    leave.status = payload.status
    leave.hr_response = payload.hr_response
    db.commit()
    db.refresh(leave)
    return leave


@router.delete("/{leave_id}", status_code=204)
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    leave = db.query(Leave).filter(Leave.id == leave_id, Leave.employee_id == current_user.id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Cannot cancel a reviewed leave request")
    db.delete(leave)
    db.commit()
