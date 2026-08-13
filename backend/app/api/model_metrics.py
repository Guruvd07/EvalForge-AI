from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.metrics.model_metrics_service import ModelMetricsService


router = APIRouter()


@router.get("")
def get_model_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ModelMetricsService.get_metrics(
        db=db,
        current_user=current_user,
    )