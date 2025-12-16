import razorpay
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.event_registration import EventRegistration
from models.user import User
import os
import traceback

class PaymentService:
    def __init__(self):
        try:
            self.client = razorpay.Client(auth=("rzp_test_Rs9tddKgc6tDB2", "QDl22J2n76GRUItmoYY1CmxT"))
            print("Razorpay client initialized successfully")
        except Exception as e:
            print(f"Failed to initialize Razorpay client: {str(e)}")
            raise e
    
    def create_order(self, db: Session, user_id: str, event_name: str, season: str, artwork_count: int, amount: int):
        """Create Razorpay order"""
        try:
            print(f"Creating order for user: {user_id}, amount: {amount}")
            
            # Test Razorpay client first
            print(f"Razorpay client: {self.client}")
            
            order_data = {
                'amount': amount * 100,  # Amount in paise
                'currency': 'INR',
                'receipt': f"order_{user_id[:10]}_{season}",  # Keep under 40 chars
                'notes': {
                    'user_id': user_id,
                    'event_name': event_name,
                    'season': season,
                    'artwork_count': str(artwork_count)
                }
            }
            
            print(f"Order data: {order_data}")
            order = self.client.order.create(data=order_data)
            print(f"Razorpay order created: {order}")
            
            return {
                "order_id": order['id'],
                "amount": order['amount'],
                "currency": order['currency'],
                "key": "rzp_test_Rs9tddKgc6tDB2"
            }
            
        except Exception as e:
            import traceback
            print(f"Error creating order: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")
    
    def verify_payment(self, db: Session, payment_id: str, order_id: str, signature: str, user_id: str, event_name: str, season: str, artwork_count: int):
        """Verify payment and create registration"""
        try:
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            self.client.utility.verify_payment_signature(params_dict)
            
            # Create event registration after successful payment
            new_registration = EventRegistration(
                user_id=user_id,
                event_name=event_name,
                season=season,
                artwork_count=artwork_count
            )
            new_registration.registration_status = "success"
            
            db.add(new_registration)
            db.commit()
            db.refresh(new_registration)
            
            # Send registration email
            from Resources.EventRegistration.EventRegistrationService import EventRegistrationService
            EventRegistrationService()._send_registration_email(db, new_registration)
            
            return {
                "message": "Payment verified and registration created successfully",
                "registration_id": new_registration.event_registration_id,
                "payment_id": payment_id
            }
            
        except razorpay.errors.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")