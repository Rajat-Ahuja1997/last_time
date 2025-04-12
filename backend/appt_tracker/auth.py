from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Security scheme for JWT
security = HTTPBearer()

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
APPLE_KEY_ID = os.getenv("APPLE_KEY_ID")
APPLE_TEAM_ID = os.getenv("APPLE_TEAM_ID")
APPLE_BUNDLE_ID = os.getenv("APPLE_BUNDLE_ID")
APPLE_PUBLIC_KEY = os.getenv("APPLE_PUBLIC_KEY")  # Base64 encoded public key

class AuthError(Exception):
    def __init__(self, error: str, status_code: int):
        self.error = error
        self.status_code = status_code

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify the JWT token from either Google or Apple
    """
    try:
        token = credentials.credentials
        
        # Try to verify as Google token first
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), GOOGLE_CLIENT_ID)
            return {
                "user_id": idinfo["sub"],
                "email": idinfo["email"],
                "provider": "google"
            }
        except ValueError:
            # If not Google token, try Apple
            try:
                # Apple tokens are signed with ECDSA using P-256 and SHA-256
                decoded = jwt.decode(
                    token,
                    APPLE_PUBLIC_KEY,
                    algorithms=['ES256'],
                    audience=[APPLE_BUNDLE_ID],
                    issuer=APPLE_TEAM_ID,
                )
                return {
                    "user_id": decoded["sub"],
                    "email": decoded.get("email"),
                    "provider": "apple"
                }
            except jwt.InvalidTokenError as e:
                raise AuthError(f"Invalid token: {str(e)}", status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency to get current user
async def get_current_user(token_data: dict = Depends(verify_token)) -> dict:
    """
    Get the current user from the verified token
    """
    return token_data 