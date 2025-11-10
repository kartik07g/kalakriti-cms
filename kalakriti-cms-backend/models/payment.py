# from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# from database import Base
# import enum

# class PaymentStatus(enum.Enum):
#     PENDING = "pending"
#     COMPLETED = "completed"
#     FAILED = "failed"
#     REFUNDED = "refunded"

# class Payment(Base):
#     __tablename__ = "payments"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     event_id = Column(Integer, ForeignKey("events.id"))
#     amount = Column(Float)
#     razorpay_order_id = Column(String(255), unique=True)
#     razorpay_payment_id = Column(String(255), unique=True, nullable=True)
#     status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
#     payment_date = Column(DateTime(timezone=True), nullable=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

#     user = relationship("User", back_populates="payments")
#     event = relationship("Event", back_populates="payments")