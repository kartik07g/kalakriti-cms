from .user import User
from .event import Event, EventCategory
from .submission import Submission
from .payment import Payment, PaymentStatus
from .result import Result, PrizeCategory

# Import Base from database to enable model creation
from ..database import Base