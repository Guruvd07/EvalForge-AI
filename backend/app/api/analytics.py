from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.analytics.analytics_service import AnalyticsService


router = APIRouter()


@router.get("")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AnalyticsService.get_model_analytics(
        db=db,
        current_user=current_user,
    )