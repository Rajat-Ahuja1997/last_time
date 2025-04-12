from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base

class LastTime(Base):
    __tablename__ = "last_times"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)  # String user_id from Supabase
    activity = Column(String, nullable=False)
    last_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Add a unique constraint for user_id + activity combination
    __table_args__ = (
        UniqueConstraint('user_id', 'activity', name='uix_user_activity'),
    ) 