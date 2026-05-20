from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: int
    employee_id: int
    assigned_at: datetime
    employee: UserResponse

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    assignments: List[AssignmentResponse] = []

    class Config:
        from_attributes = True


class AssignRequest(BaseModel):
    employee_id: int
