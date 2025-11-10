from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.asset import Asset
from schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from typing import List

class AssetService:
    
    def create_asset(self, db: Session, asset_data: AssetCreate):
        """Create a new asset"""
        new_asset = Asset(
            event_registration_id=asset_data.event_registration_id,
            asset_url=asset_data.asset_url,
            asset_name=asset_data.asset_name
        )
        
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        
        return {
            "message": "Asset created successfully",
            "asset": AssetResponse.model_validate(new_asset)
        }
    
    def get_assets(self, db: Session, **filters) -> List[AssetResponse]:
        """Get assets with optional filtering"""
        query = db.query(Asset)
        
        if filters.get('event_registration_id'):
            query = query.filter(Asset.event_registration_id == filters['event_registration_id'])
        if filters.get('asset_name'):
            query = query.filter(Asset.asset_name.ilike(f"%{filters['asset_name']}%"))
        
        assets = query.all()
        return [AssetResponse.model_validate(asset) for asset in assets]
    
    def get_asset_by_id(self, db: Session, asset_id: str):
        """Get a specific asset by ID"""
        asset = db.query(Asset).filter(Asset.asset_id == asset_id).first()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        return AssetResponse.model_validate(asset)
    
    def update_asset(self, db: Session, asset_id: str, asset_data: AssetUpdate):
        """Update asset information"""
        asset = db.query(Asset).filter(Asset.asset_id == asset_id).first()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        update_data = asset_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(asset, field, value)
        
        db.commit()
        db.refresh(asset)
        
        return {
            "message": "Asset updated successfully",
            "asset": AssetResponse.model_validate(asset)
        }
    
    def delete_asset(self, db: Session, asset_id: str):
        """Delete an asset"""
        asset = db.query(Asset).filter(Asset.asset_id == asset_id).first()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        db.delete(asset)
        db.commit()
        
        return {"message": "Asset deleted successfully"}