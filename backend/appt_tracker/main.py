import uvicorn
from fastapi import FastAPI
from database import engine, Base
from .models import LastTime
from .api import router as last_time_router

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="Last Time Tracker")

# Include routers
app.include_router(last_time_router)

if __name__ == '__main__':
    uvicorn.run('appt_tracker.main:app', port=8002, reload=True) 