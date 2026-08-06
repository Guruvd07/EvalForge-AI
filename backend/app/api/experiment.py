from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentResponse,
)
from app.services.experiment_service import ExperimentService

router = APIRouter(
    prefix="/experiments",
    tags=["Experiments"]
)


@router.post(
    "",
    response_model=ExperimentResponse,
    status_code=201
)
def create_experiment(
    experiment: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ExperimentService.create_experiment(
        db,
        experiment,
        current_user
    )
    
    
@router.get(
    "",
    response_model=list[ExperimentResponse]
)
def get_experiments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ExperimentService.get_user_experiments(
        db,
        current_user
    )