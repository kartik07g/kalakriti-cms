from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserUpdate, UserResponseSchema, UserLogin
from core.database import get_db
from core.auth_utils import login_required, get_current_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
from .UserService import UserService, UserAuthFront
from typing import List, Optional

user_router = APIRouter(prefix="/v1/backend", tags=["User"])


@user_router.post("/signout")
@login_required
def signout():
    return UserService().logout()

@user_router.post("/signup")
async def sign_up(user_data: UserCreate, db: Session = Depends(get_db)):
    return UserAuthFront().signup(db, user_data)

@user_router.post("/signin")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    loginRes = UserAuthFront().signin(db, login_data)
    loginRes["token_vlidity"] = str(ACCESS_TOKEN_EXPIRE_MINUTES) 
    return loginRes

@user_router.get("/users")
def get_users(request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    filters = dict(request.query_params)
    response = UserService().get_users(db, current_user, **filters)
    return {"users": response} if isinstance(response, list) else response

@user_router.patch("/user/{user_id}")
def update_user(user_id, user_data: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return UserService().update_user(db, user_id, user_data, current_user)

@user_router.delete("/user/{user_id}")
def remove_user(user_id ,db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return UserService().remove_user(user_id, db, current_user)
