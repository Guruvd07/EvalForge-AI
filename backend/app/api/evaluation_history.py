from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.evaluation.history_service import HistoryService


router = APIRouter()


@router.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return HistoryService.get_history(
        db=db,
        current_user=current_user,
        page=page,
        page_size=page_size,
    )