from functools import wraps
from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.user import User  # Import your User model
from core.database import get_db  # Import the DB session dependency
import json
import os

# Define password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/signin")

SECRET_KEY = "JWT232445ASF234"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expiration time

# Hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Create access token
def create_access_token(user_id: str, role: str, expires_delta: timedelta = None) -> str:
    """
    Generate a JWT token with user ID and role.
    """
    if not isinstance(user_id, str) or not user_id.startswith("USER"):
        raise ValueError("User ID must be a string in the format 'USER1234567'")

    to_encode = {
        "sub": user_id
    }
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_reset_password_token(user_id: str, expires_delta: timedelta = timedelta(minutes=30)) -> str:
    to_encode = {
        "sub": user_id,
        "type": "password_reset",
        "exp": datetime.utcnow() + expires_delta
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_reset_password_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# Get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Decode JWT token and retrieve the user object including role.
    """
    try:
        print("Received Token:", token)

        payload = jwt.decode(str(token), SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded Token Payload:", payload)

        user_id = payload.get("sub")

        if not isinstance(user_id, str) or not user_id.startswith("USER"):
            raise HTTPException(status_code=401, detail="Invalid token payload (invalid user_id)")

        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return user

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError as e:
        print("JWT Error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_admin_user(
    user: User = Depends(get_current_user)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Middleware-based login_required decorator
def login_required(f):
    @wraps(f)
    async def decorated(*args, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db), **kwargs):
        if not token:
            raise HTTPException(status_code=401, detail="Token missing")
        
        user = get_current_user(token, db)  # Authenticate user
        kwargs["current_user"] = user  # Add user to kwargs
        
        return await f(*args, **kwargs)  # Call original function
    
    return decorated
