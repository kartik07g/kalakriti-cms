from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ResultCreate(BaseModel):
    name: str
    user_id: str
    score: int
    remarks: Optional[str] = None
    category: str
    rank: int = Field(gt=0, description="Rank must be greater than 0")

class ResultUpdate(BaseModel):
    name: Optional[str] = None
    user_id: Optional[str] = None
    score: Optional[int] = None
    remarks: Optional[str] = None
    category: Optional[str] = None
    rank: Optional[int] = Field(None, gt=0, description="Rank must be greater than 0")

class ResultResponse(BaseModel):
    result_id: str
    name: str
    user_id: str
    score: int
    remarks: Optional[str] = None
    category: str
    rank: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class ResultListResponse(BaseModel):
    results: List[ResultResponse]