from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import SessionLocal
from .models import LastTime
from pydantic import BaseModel
from datetime import datetime

# Pydantic models for request/response
class LastTimeBase(BaseModel):
    user_id: str
    activity: str
    last_date: datetime

class LastTimeCreate(LastTimeBase):
    pass

class LastTimeResponse(LastTimeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Create router
router = APIRouter(prefix="/last-time", tags=["last-time"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=LastTimeResponse)
def create_last_time(last_time: LastTimeCreate, db: Session = Depends(get_db)):
    # Check if activity already exists for this user
    existing = db.query(LastTime).filter(
        LastTime.user_id == last_time.user_id,
        LastTime.activity == last_time.activity.lower()
    ).first()
    
    if existing:
        # Update existing record
        existing.last_date = last_time.last_date
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new record
    db_last_time = LastTime(
        user_id=last_time.user_id,
        activity=last_time.activity.lower(),
        last_date=last_time.last_date,
    )
    db.add(db_last_time)
    db.commit()
    db.refresh(db_last_time)
    return db_last_time

@router.get("/", response_model=List[LastTimeResponse])
def read_last_times(
    user_id: str,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    last_times = db.query(LastTime).filter(
        LastTime.user_id == user_id
    ).order_by(desc(LastTime.last_date)).offset(skip).limit(limit).all()
    return last_times

@router.get("/{activity}", response_model=LastTimeResponse)
def read_last_time(activity: str, user_id: str, db: Session = Depends(get_db)):
    last_time = db.query(LastTime).filter(
        LastTime.user_id == user_id,
        LastTime.activity == activity.lower()
    ).first()
    
    if last_time is None:
        raise HTTPException(status_code=404, detail=f"No record found for activity: {activity}")
    return last_time

@router.delete("/{activity}")
def delete_last_time(activity: str, user_id: str, db: Session = Depends(get_db)):
    last_time = db.query(LastTime).filter(
        LastTime.user_id == user_id,
        LastTime.activity == activity.lower()
    ).first()
    
    if last_time is None:
        raise HTTPException(status_code=404, detail=f"No record found for activity: {activity}")
    
    db.delete(last_time)
    db.commit()
    return {"message": f"Record for '{activity}' deleted successfully"} 