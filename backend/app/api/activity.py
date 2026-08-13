from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.activity.activity_service import ActivityService


router = APIRouter()


@router.get("")
def get_recent_activity(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ActivityService.get_recent_activity(
        db=db,
        current_user=current_user,
        limit=limit,
    )