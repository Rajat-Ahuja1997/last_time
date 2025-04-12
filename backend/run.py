import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from appt_tracker.api import router as last_time_router


# Create database tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

# Create FastAPI app
app = FastAPI(title="Last Time Tracker")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(last_time_router)

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