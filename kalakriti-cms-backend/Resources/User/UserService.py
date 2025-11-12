from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserResponseSchema
from core.auth_utils import hash_password, verify_password, create_access_token
from typing import List, Optional, Dict, Any
import uuid


class UserService:
    
    def logout(self):
        """Handle user logout"""
        return {"message": "Successfully logged out"}
    
    def signup(self, db: Session, user_data: UserCreate):
        """Create a new user account"""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create new user
        new_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            age=user_data.age,
            address=user_data.address,
            city=user_data.city,
            state=user_data.state,
            previous_experience=user_data.previous_experience,
            password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create access token
        access_token = create_access_token(user_id=new_user.user_id, role="user")
        
        return {
            "message": "User created successfully",
            "user": UserResponseSchema.model_validate(new_user),
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    def get_users(self, db: Session, current_user: User, **filters) -> List[UserResponseSchema]:
        """Get users with optional filtering"""
        query = db.query(User).filter(User.status == True)
        
        # Apply filters
        if filters.get('user_id'):
            query = query.filter(User.user_id == filters['user_id'])
        if filters.get('email'):
            query = query.filter(User.email.ilike(f"%{filters['email']}%"))
        if filters.get('city'):
            query = query.filter(User.city.ilike(f"%{filters['city']}%"))
        if filters.get('state'):
            query = query.filter(User.state.ilike(f"%{filters['state']}%"))
        if filters.get('age'):
            query = query.filter(User.age == filters['age'])
        
        users = query.all()
        return [UserResponseSchema.model_validate(user) for user in users]
    
    def update_user(self, db: Session, user_id: str, user_data: UserUpdate, current_user: User):
        """Update user information"""
        # Find user to update
        user = db.query(User).filter(User.user_id == user_id, User.status == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if current user can update this user (self or admin)
        if current_user.user_id != user_id and getattr(current_user, 'role', 'user') != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if 'password' in update_data:
            update_data['password'] = hash_password(update_data['password'])
        
        # Check email uniqueness if email is being updated
        if 'email' in update_data and update_data['email'] != user.email:
            existing_user = db.query(User).filter(User.email == update_data['email']).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already exists")
        
        # Apply updates
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": "User updated successfully",
            "user": UserResponseSchema.model_validate(user)
        }
    
    def remove_user(self, user_id: str, db: Session, current_user: User):
        """Soft delete a user"""
        # Find user to delete
        user = db.query(User).filter(User.user_id == user_id, User.status == True).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if current user can delete this user (self or admin)
        if current_user.user_id != user_id and getattr(current_user, 'role', 'user') != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized to delete this user")
        
        # Soft delete by setting status to False
        user.status = False
        db.commit()
        
        return {"message": "User deleted successfully"}
    
    def signin(self, db: Session, login_data):
        """Authenticate user and return access token"""
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email, User.status == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token(user_id=user.user_id, role="user")
        
        return {
            "message": "Login successful",
            "user": UserResponseSchema.model_validate(user),
            "access_token": access_token,
            "token_type": "bearer"
        }


class UserAuthFront:
    """Authentication frontend class for signup"""
    
    def signup(self, db: Session, user_data: UserCreate):
        """Wrapper for UserService signup"""
        return UserService().signup(db, user_data)
    
    def signin(self, db: Session, login_data):
        """Wrapper for UserService signin"""
        return UserService().signin(db, login_data)