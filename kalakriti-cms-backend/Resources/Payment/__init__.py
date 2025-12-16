from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from core.auth_utils import get_current_user
from models.user import User
from .PaymentService import PaymentService

payment_router = APIRouter(prefix="/v1/backend", tags=["Payment"])

class CreateOrderRequest(BaseModel):
    event_name: str
    season: str
    artwork_count: int
    amount: int

class VerifyPaymentRequest(BaseModel):
    payment_id: str
    order_id: str
    signature: str
    event_name: str
    season: str
    artwork_count: int

@payment_router.get("/payment/test")
def test_payment():
    return {"message": "Payment service is working"}

@payment_router.post("/payment/create-order")
def create_payment_order(
    order_data: CreateOrderRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        print(f"Creating order for user: {current_user.user_id}")
        return PaymentService().create_order(
            db, 
            current_user.user_id, 
            order_data.event_name, 
            order_data.season, 
            order_data.artwork_count, 
            order_data.amount
        )
    except Exception as e:
        print(f"Error in create_payment_order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@payment_router.post("/payment/verify")
def verify_payment(
    payment_data: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PaymentService().verify_payment(
        db,
        payment_data.payment_id,
        payment_data.order_id,
        payment_data.signature,
        current_user.user_id,
        payment_data.event_name,
        payment_data.season,
        payment_data.artwork_count
    )