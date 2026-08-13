from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.search.search_service import SearchService


router = APIRouter()


@router.get("")
def search_experiments(
    query: str = Query(default=""),
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SearchService.search_experiments(
        db=db,
        current_user=current_user,
        query=query,
        status=status,
        page=page,
        page_size=page_size,
    )