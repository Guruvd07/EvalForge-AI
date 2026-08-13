from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.leaderboard.leaderboard_service import LeaderboardService


router = APIRouter()


@router.get("")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return LeaderboardService.get_leaderboard(
        db=db,
        current_user=current_user,
    )