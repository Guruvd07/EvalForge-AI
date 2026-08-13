from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment


router = APIRouter(
    prefix="/evaluation-runs",
    tags=["Evaluation"],
)


@router.get("/{run_id}/results")
def get_results(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify that the evaluation run belongs to an experiment
    # owned by the authenticated user.
    run = (
        db.query(EvaluationRun)
        .join(
            Experiment,
            EvaluationRun.experiment_id == Experiment.id,
        )
        .filter(
            EvaluationRun.id == run_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Evaluation run not found",
        )

    results = (
        db.query(EvaluationResult)
        .filter(
            EvaluationResult.evaluation_run_id == run_id
        )
        .all()
    )

    return results