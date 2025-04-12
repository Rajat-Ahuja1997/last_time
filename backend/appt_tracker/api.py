from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import SessionLocal
from .models import LastTime, Category
from pydantic import BaseModel
from datetime import datetime
from .auth import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_user_based_key(request: Request) -> str:
    """
    Create a rate limit key based on both IP and user ID (if authenticated).
    This prevents IP spoofing from bypassing limits and ensures per-user limits.
    """
    user = request.scope.get("user")
    ip = get_remote_address(request)
    
    # If user is authenticated, combine IP and user_id
    if user and isinstance(user, dict) and "user_id" in user:
        return f"{ip}:{user['user_id']}"
    
    # Fallback to IP only if not authenticated
    return ip

# Create rate limiter with custom key function
limiter = Limiter(key_func=get_user_based_key)

# Pydantic models for request/response
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class LastTimeBase(BaseModel):
    activity: str
    last_date: datetime
    category_id: Optional[int] = None

class LastTimeCreate(LastTimeBase):
    pass

class LastTimeResponse(LastTimeBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Create routers
activity_router = APIRouter(prefix="/activity", tags=["activity"])
category_router = APIRouter(prefix="/categories", tags=["categories"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Category endpoints
@category_router.post("/", response_model=CategoryResponse)
@limiter.limit("20/minute")
async def create_category(
    request: Request,
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    
    # Check if category already exists
    existing = db.query(Category).filter(
        Category.user_id == user_id,
        Category.name == category.name.lower()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Category '{category.name}' already exists"
        )
    
    db_category = Category(
        user_id=user_id,
        name=category.name.lower()
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@category_router.get("/", response_model=List[CategoryResponse])
@limiter.limit("60/minute")
async def read_categories(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    categories = db.query(Category).filter(Category.user_id == user_id).all()
    return categories

@category_router.delete("/{category_id}")
@limiter.limit("20/minute")
async def delete_category(
    request: Request,
    category_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == user_id
    ).first()
    
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Remove category_id from associated LastTime records
    db.query(LastTime).filter(LastTime.category_id == category_id).update(
        {"category_id": None}
    )
    
    db.delete(category)
    db.commit()
    return {"message": f"Category '{category.name}' deleted successfully"}

# LastTime endpoints
@activity_router.post("/", response_model=LastTimeResponse)
@limiter.limit("30/minute")
async def create_last_time(
    request: Request,
    last_time: LastTimeCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    
    # Verify category exists if provided
    if last_time.category_id:
        category = db.query(Category).filter(
            Category.id == last_time.category_id,
            Category.user_id == user_id
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if activity already exists for this user
    existing = db.query(LastTime).filter(
        LastTime.user_id == user_id,
        LastTime.activity == last_time.activity.lower()
    ).first()
    
    if existing:
        # Update existing record
        existing.last_date = last_time.last_date
        existing.category_id = last_time.category_id
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new record
    db_last_time = LastTime(
        user_id=user_id,
        activity=last_time.activity.lower(),
        last_date=last_time.last_date,
        category_id=last_time.category_id
    )
    db.add(db_last_time)
    db.commit()
    db.refresh(db_last_time)
    return db_last_time

@activity_router.get("/", response_model=List[LastTimeResponse])
@limiter.limit("60/minute")
async def read_last_times(
    request: Request,
    skip: int = 0, 
    limit: int = 100,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    query = db.query(LastTime).filter(LastTime.user_id == user_id)
    
    if category_id is not None:
        query = query.filter(LastTime.category_id == category_id)
    
    last_times = query.order_by(desc(LastTime.last_date)).offset(skip).limit(limit).all()
    return last_times

@activity_router.get("/{activity}", response_model=LastTimeResponse)
@limiter.limit("60/minute")
async def read_last_time(
    request: Request,
    activity: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    last_time = db.query(LastTime).filter(
        LastTime.user_id == user_id,
        LastTime.activity == activity.lower()
    ).first()
    
    if last_time is None:
        raise HTTPException(status_code=404, detail=f"No record found for activity: {activity}")
    return last_time

@activity_router.delete("/{activity}")
@limiter.limit("20/minute")
async def delete_last_time(
    request: Request,
    activity: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    last_time = db.query(LastTime).filter(
        LastTime.user_id == user_id,
        LastTime.activity == activity.lower()
    ).first()
    
    if last_time is None:
        raise HTTPException(status_code=404, detail=f"No record found for activity: {activity}")
    
    db.delete(last_time)
    db.commit()
    return {"message": f"Record for '{activity}' deleted successfully"} 