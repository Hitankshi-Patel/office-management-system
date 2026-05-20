from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.project import Project, ProjectAssignment
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, AssignRequest
from app.core.deps import get_current_user, require_owner

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    project = Project(
        name=payload.name,
        description=payload.description,
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.employee:
        # employees see only their assigned projects
        assignments = db.query(ProjectAssignment).filter(
            ProjectAssignment.employee_id == current_user.id
        ).all()
        project_ids = [a.project_id for a in assignments]
        return db.query(Project).filter(Project.id.in_(project_ids)).all()
    return db.query(Project).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


@router.post("/{project_id}/assign", status_code=201)
def assign_employee(
    project_id: int,
    payload: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    """Owner assigns an employee to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    employee = db.query(User).filter(
        User.id == payload.employee_id,
        User.role == UserRole.employee,
        User.is_active == True,
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(ProjectAssignment).filter(
        ProjectAssignment.project_id == project_id,
        ProjectAssignment.employee_id == payload.employee_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee already assigned")

    assignment = ProjectAssignment(project_id=project_id, employee_id=payload.employee_id)
    db.add(assignment)
    db.commit()
    return {"message": "Employee assigned successfully"}


@router.delete("/{project_id}/assign/{employee_id}", status_code=204)
def unassign_employee(
    project_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    assignment = db.query(ProjectAssignment).filter(
        ProjectAssignment.project_id == project_id,
        ProjectAssignment.employee_id == employee_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
