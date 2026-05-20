from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.ticket import TicketStatus


class TicketCreate(BaseModel):
    title: str
    description: str


class TicketResolve(BaseModel):
    hr_response: str


class TicketResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: str
    status: TicketStatus
    hr_response: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
