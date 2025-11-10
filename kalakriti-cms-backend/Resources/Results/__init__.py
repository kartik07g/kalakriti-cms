from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from schemas.result import ResultCreate, ResultUpdate, ResultResponse
from core.database import get_db
from .ResultService import ResultService

result_router = APIRouter(prefix="/v1/backend", tags=["Results"])

@result_router.post("/results", response_model=dict)
def create_result(result_data: ResultCreate, db: Session = Depends(get_db)):
    return ResultService().create_result(db, result_data)

@result_router.post("/results/upload-csv", response_model=dict)
def upload_results_csv(
    csv_file: UploadFile = File(...),
    event_name: str = Form(...),
    season: str = Form(...),
    db: Session = Depends(get_db)
):
    return ResultService().upload_results_csv(db, csv_file, event_name, season)

@result_router.get("/results")
def get_results(request: Request, db: Session = Depends(get_db)):
    filters = dict(request.query_params)
    response = ResultService().get_results(db, **filters)
    return {"results": response}

@result_router.get("/results/{result_id}", response_model=ResultResponse)
def get_result(result_id: str, db: Session = Depends(get_db)):
    return ResultService().get_result_by_id(db, result_id)

@result_router.patch("/results/{result_id}", response_model=dict)
def update_result(result_id: str, result_data: ResultUpdate, db: Session = Depends(get_db)):
    return ResultService().update_result(db, result_id, result_data)

@result_router.delete("/results/{result_id}")
def delete_result(result_id: str, db: Session = Depends(get_db)):
    return ResultService().delete_result(db, result_id)