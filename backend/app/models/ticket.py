import enum
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class TicketStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, nullable=False)
    hr_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("User", back_populates="tickets")
