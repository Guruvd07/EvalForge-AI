from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.quality.quality_service import QualityService


router = APIRouter()


@router.get("")
def get_quality_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return QualityService.calculate_scores(
        db=db,
        current_user=current_user,
    )