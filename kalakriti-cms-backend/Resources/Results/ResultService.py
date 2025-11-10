from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from models.result import Result
from schemas.result import ResultCreate, ResultUpdate, ResultResponse
from typing import List
import csv
import io

class ResultService:
    
    def create_result(self, db: Session, result_data: ResultCreate):
        """Create a new result"""
        new_result = Result(
            name=result_data.name,
            user_id=result_data.user_id,
            score=result_data.score,
            category=result_data.category,
            rank=result_data.rank,
            remarks=result_data.remarks,
            event_name=result_data.event_name,
            season=result_data.season
        )
        
        db.add(new_result)
        db.commit()
        db.refresh(new_result)
        
        return {
            "message": "Result created successfully",
            "result": ResultResponse.model_validate(new_result)
        }
    
    def upload_results_csv(self, db: Session, file: UploadFile, event_name: str, season: str):
        """Upload results from CSV file"""
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        content = file.file.read()
        csv_data = io.StringIO(content.decode('utf-8'))
        csv_reader = csv.DictReader(csv_data)
        
        results_created = []
        
        for row in csv_reader:
            try:
                new_result = Result(
                    name=row['name'],
                    user_id=row['user_id'],
                    score=int(row['score']),
                    category=row['category'],
                    rank=int(row['rank']),
                    remarks=row.get('remarks'),
                    event_name=event_name,
                    season=season
                )
                db.add(new_result)
                results_created.append(new_result)
            except (KeyError, ValueError) as e:
                raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Successfully created {len(results_created)} results",
            "count": len(results_created)
        }
    
    def get_results(self, db: Session, **filters) -> List[ResultResponse]:
        """Get results with optional filtering"""
        query = db.query(Result)
        
        if filters.get('name'):
            query = query.filter(Result.name.ilike(f"%{filters['name']}%"))
        if filters.get('user_id'):
            query = query.filter(Result.user_id == filters['user_id'])
        if filters.get('category'):
            query = query.filter(Result.category.ilike(f"%{filters['category']}%"))
        if filters.get('rank'):
            query = query.filter(Result.rank == int(filters['rank']))
        if filters.get('score'):
            query = query.filter(Result.score == int(filters['score']))
        
        results = query.all()
        return [ResultResponse.model_validate(result) for result in results]
    
    def get_result_by_id(self, db: Session, result_id: str):
        """Get a specific result by ID"""
        result = db.query(Result).filter(Result.result_id == result_id).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        
        return ResultResponse.model_validate(result)
    
    def update_result(self, db: Session, result_id: str, result_data: ResultUpdate):
        """Update result information"""
        result = db.query(Result).filter(Result.result_id == result_id).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        
        update_data = result_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(result, field, value)
        
        db.commit()
        db.refresh(result)
        
        return {
            "message": "Result updated successfully",
            "result": ResultResponse.model_validate(result)
        }
    
    def delete_result(self, db: Session, result_id: str):
        """Delete a result"""
        result = db.query(Result).filter(Result.result_id == result_id).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        
        db.delete(result)
        db.commit()
        
        return {"message": "Result deleted successfully"}