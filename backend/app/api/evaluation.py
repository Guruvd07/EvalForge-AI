from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment

from app.schemas.evaluation_run import (
    EvaluationRunCreate,
    EvaluationRunResponse,
)

from app.services.evaluation.service import EvaluationService


router = APIRouter(
    prefix="/evaluation-runs",
    tags=["Evaluation"],
)


# ============================================================
# GET EVALUATION RUNS
# ============================================================

@router.get(
    "",
)
async def get_evaluation_runs(
    experiment_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get evaluation runs for a specific experiment.

    Supports pagination and verifies that the experiment
    belongs to the currently authenticated user.
    """

    # --------------------------------------------------------
    # Verify experiment ownership
    # --------------------------------------------------------

    experiment = (
        db.query(Experiment)
        .filter(
            Experiment.id == experiment_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not experiment:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found",
        )

    # --------------------------------------------------------
    # Count total runs
    # --------------------------------------------------------

    total = (
        db.query(EvaluationRun)
        .filter(
            EvaluationRun.experiment_id == experiment_id
        )
        .count()
    )

    # --------------------------------------------------------
    # Pagination
    # --------------------------------------------------------

    offset = (page - 1) * page_size

    runs = (
        db.query(EvaluationRun)
        .filter(
            EvaluationRun.experiment_id == experiment_id
        )
        .order_by(EvaluationRun.started_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # --------------------------------------------------------
    # Return the format expected by frontend
    # --------------------------------------------------------

    return {
        "items": runs,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ============================================================
# POST EVALUATION RUN
# ============================================================

@router.post(
    "",
    response_model=EvaluationRunResponse,
    status_code=201,
)
async def run_evaluation(
    request: EvaluationRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start and execute an evaluation run.
    """

    # --------------------------------------------------------
    # Verify experiment ownership
    # --------------------------------------------------------

    experiment = (
        db.query(Experiment)
        .filter(
            Experiment.id == request.experiment_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not experiment:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found",
        )

    # --------------------------------------------------------
    # Create evaluation run
    # --------------------------------------------------------

    run = EvaluationRun(
        experiment_id=request.experiment_id,
        status="running",
        started_at=datetime.utcnow(),
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    # --------------------------------------------------------
    # Execute evaluation
    # --------------------------------------------------------

    try:

        await EvaluationService.evaluate(
            db=db,
            evaluation_run_id=run.id,
            experiment_id=request.experiment_id,
            selected_models=request.selected_models,
        )

        # ----------------------------------------------------
        # Mark run completed
        # ----------------------------------------------------

        run.status = "completed"
        run.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(run)

        return run

    except Exception:

        # ----------------------------------------------------
        # Mark failed evaluation
        # ----------------------------------------------------

        run.status = "failed"
        run.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(run)

        raise