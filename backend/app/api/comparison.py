from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.comparison.comparison_service import ComparisonService


router = APIRouter()


@router.get("")
def compare_models(
    models: list[str] = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ComparisonService.compare_models(
        db=db,
        current_user=current_user,
        model_names=models,
    )