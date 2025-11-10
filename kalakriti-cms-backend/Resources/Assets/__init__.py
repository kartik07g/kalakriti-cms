from fastapi import APIRouter, Depends, Request, Form, UploadFile, File
from sqlalchemy.orm import Session
from schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from core.database import get_db
from core.UploadToS3 import upload_strategy
from .AssetService import AssetService
from typing import Optional

asset_router = APIRouter(prefix="/v1/backend", tags=["Assets"])

@asset_router.post("/assets", response_model=dict)
async def create_asset(
    title: str = Form(...),
    asset_type: str = Form(...),
    media_file: UploadFile = File(...),
    event_registration_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # Upload file using strategy
    file_url = await upload_strategy.upload_file(media_file, "assets")
    
    # Create asset data
    asset_data = AssetCreate(
        event_registration_id=event_registration_id,
        asset_url=file_url,
        asset_name=title
    )
    
    return AssetService().create_asset(db, asset_data)

@asset_router.get("/assets")
def get_assets(request: Request, db: Session = Depends(get_db)):
    filters = dict(request.query_params)
    response = AssetService().get_assets(db, **filters)
    return {"assets": response}

@asset_router.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    return AssetService().get_asset_by_id(db, asset_id)

@asset_router.patch("/assets/{asset_id}", response_model=dict)
def update_asset(asset_id: str, asset_data: AssetUpdate, db: Session = Depends(get_db)):
    return AssetService().update_asset(db, asset_id, asset_data)

@asset_router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    return AssetService().delete_asset(db, asset_id)