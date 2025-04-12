import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from appt_tracker.api import activity_router, category_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Create rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Create database tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

# Create FastAPI app
app = FastAPI(title="Last Time Tracker")

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(activity_router)
app.include_router(category_router)

if __name__ == "__main__":
    # Initialize the database
    init_db()
    
    # Run the FastAPI application with uvicorn
    uvicorn.run(
        'run:app',
        host="0.0.0.0",  # Allow external connections
        port=8000,       # Port number
        reload=True      # Enable auto-reload for development
    ) 