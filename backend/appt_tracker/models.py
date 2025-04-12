from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with LastTime
    last_times = relationship("LastTime", back_populates="category")
    
    # Unique constraint for user_id + category name
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uix_user_category'),
    )

class LastTime(Base):
    __tablename__ = "last_times"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)  # String user_id from Supabase
    activity = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    last_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship with Category
    category = relationship("Category", back_populates="last_times")
    
    # Add a unique constraint for user_id + activity combination
    __table_args__ = (
        UniqueConstraint('user_id', 'activity', name='uix_user_activity'),
    ) 