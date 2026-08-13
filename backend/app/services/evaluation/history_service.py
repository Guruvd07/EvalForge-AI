from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation_run import EvaluationRun
from app.models.evaluation_result import EvaluationResult
from app.models.experiment import Experiment
from app.models.user import User


class HistoryService:

    @staticmethod
    def get_history(
        db: Session,
        current_user: User,
        page: int = 1,
        page_size: int = 10,
    ):
        offset = (page - 1) * page_size

        total = (
            db.query(func.count(EvaluationRun.id))
            .join(
                Experiment,
                EvaluationRun.experiment_id == Experiment.id,
            )
            .filter(
                Experiment.user_id == current_user.id
            )
            .scalar()
            or 0
        )

        rows = (
            db.query(
                EvaluationRun.id.label("run_id"),
                EvaluationRun.status,
                EvaluationRun.started_at,
                EvaluationRun.completed_at,
                EvaluationRun.selected_models,
                Experiment.title.label("experiment_title"),
                func.count(EvaluationResult.id).label("result_count"),
            )
            .join(
                Experiment,
                EvaluationRun.experiment_id == Experiment.id,
            )
            .outerjoin(
                EvaluationResult,
                EvaluationResult.evaluation_run_id == EvaluationRun.id,
            )
            .filter(
                Experiment.user_id == current_user.id
            )
            .group_by(
                EvaluationRun.id,
                Experiment.title,
            )
            .order_by(EvaluationRun.started_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        items = []

        for row in rows:
            items.append(
                {
                    "run_id": row.run_id,
                    "experiment_title": row.experiment_title,
                    "status": row.status,
                    "started_at": row.started_at,
                    "completed_at": row.completed_at,
                    "selected_models": row.selected_models,
                    "result_count": row.result_count,
                }
            )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }