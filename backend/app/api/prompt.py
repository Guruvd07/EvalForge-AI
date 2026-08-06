from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptResponse
from app.services.prompt_service import PromptService

router = APIRouter(
    prefix="/prompts",
    tags=["Prompts"]
)


@router.post(
    "",
    response_model=PromptResponse,
    status_code=201
)
def create_prompt(
    prompt: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return PromptService.create_prompt(
            db,
            prompt,
            current_user
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )