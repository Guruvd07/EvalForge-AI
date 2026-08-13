from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class ModelMetricsService:

    @staticmethod
    def get_metrics(
        db: Session,
        current_user: User,
    ):
        rows = (
            db.query(
                EvaluationResult.model_name,
                func.min(EvaluationResult.latency_ms).label("min_latency"),
                func.max(EvaluationResult.latency_ms).label("max_latency"),
                func.avg(EvaluationResult.latency_ms).label("avg_latency"),
                func.sum(EvaluationResult.total_tokens).label("total_tokens"),
                func.count(EvaluationResult.id).label("evaluations"),
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
                "evaluations": row.evaluations,
                "min_latency": row.min_latency,
                "max_latency": row.max_latency,
                "avg_latency": round(row.avg_latency or 0, 2),
                "total_tokens": row.total_tokens or 0,
            }
            for row in rows
        ]