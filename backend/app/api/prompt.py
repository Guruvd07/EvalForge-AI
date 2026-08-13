from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
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
    status_code=status.HTTP_201_CREATED
)
def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return PromptService.create_prompt(
            db,
            prompt_data,
            current_user
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "/{experiment_id}",
    response_model=List[PromptResponse]
)
def get_prompts_by_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return PromptService.get_prompts_by_experiment(
            db,
            experiment_id,
            current_user
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )