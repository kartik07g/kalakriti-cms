from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile

class AssetCreate(BaseModel):
    event_registration_id: str
    asset_url: str
    asset_name: str

class AssetUpdate(BaseModel):
    asset_url: Optional[str] = None
    asset_name: Optional[str] = None

class AssetResponse(BaseModel):
    asset_id: str
    event_registration_id: str
    asset_url: str
    asset_name: str
    create_dt: datetime

    model_config = {
        "from_attributes": True
    }

class AssetListResponse(BaseModel):
    assets: List[AssetResponse]