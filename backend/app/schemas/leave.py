from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.leave import LeaveStatus


class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str


class LeaveReview(BaseModel):
    status: LeaveStatus
    hr_response: Optional[str] = None


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date
    reason: str
    status: LeaveStatus
    hr_response: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
