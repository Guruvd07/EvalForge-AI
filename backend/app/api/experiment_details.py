from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.user import User

from app.database.dependencies import get_db
from app.services.experiment.experiment_details_service import (
    ExperimentDetailsService,
)

router = APIRouter()


@router.get("/{experiment_id}")
def get_experiment_details(
    experiment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    data = ExperimentDetailsService.get_details(
        db,
        experiment_id,
        current_user,
    )

    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found",
        )

    return data