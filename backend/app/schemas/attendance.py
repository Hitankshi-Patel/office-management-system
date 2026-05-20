from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    clock_in: Optional[datetime]
    clock_out: Optional[datetime]
    hours_worked: Optional[float]

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    employee_id: int
    employee_name: str
    total_hours: float
    estimated_pay: float
