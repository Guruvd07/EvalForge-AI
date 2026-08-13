from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.evaluation_run import EvaluationRun
from app.schemas.evaluation_run import (
    EvaluationRunCreate,
    EvaluationRunResponse,
)

from app.services.evaluation.service import EvaluationService

router = APIRouter(
    prefix="/evaluation-runs",
    tags=["Evaluation"]
)


@router.post(
    "",
    response_model=EvaluationRunResponse,
    status_code=201
)
async def run_evaluation(
    request: EvaluationRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    run = EvaluationRun(
        experiment_id=request.experiment_id,
        status="running",
        started_at=datetime.utcnow()
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    await EvaluationService.evaluate(
        db=db,
        evaluation_run_id=run.id,
        experiment_id=request.experiment_id,
        selected_models=request.selected_models,
    )

    run.status = "completed"
    run.completed_at = datetime.utcnow()

    db.commit()

    return run