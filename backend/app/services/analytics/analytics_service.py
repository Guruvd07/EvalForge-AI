from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class AnalyticsService:

    @staticmethod
    def get_model_analytics(
        db: Session,
        current_user: User,
    ):
        rows = (
            db.query(
                EvaluationResult.model_name,
                func.count(EvaluationResult.id).label("runs"),
                func.avg(EvaluationResult.latency_ms).label("latency"),
                func.avg(EvaluationResult.total_tokens).label("tokens"),
            )
            .join(
                EvaluationRun,
                EvaluationResult.evaluation_run_id == EvaluationRun.id,
            )
            .join(
                Experiment,
                EvaluationRun.experiment_id == Experiment.id,
            )
            .filter(
                Experiment.user_id == current_user.id
            )
            .group_by(EvaluationResult.model_name)
            .all()
        )

        return [
            {
                "model": row.model_name,
                "runs": row.runs,
                "avg_latency_ms": round(row.latency or 0, 2),
                "avg_tokens": round(row.tokens or 0, 2),
            }
            for row in rows
        ]