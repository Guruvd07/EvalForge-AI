from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class ComparisonService:

    @staticmethod
    def compare_models(
        db: Session,
        current_user: User,
        model_names: list[str],
    ):
        results = (
            db.query(EvaluationResult)
            .join(
                EvaluationRun,
                EvaluationResult.evaluation_run_id == EvaluationRun.id,
            )
            .join(
                Experiment,
                EvaluationRun.experiment_id == Experiment.id,
            )
            .filter(
                Experiment.user_id == current_user.id,
                EvaluationResult.model_name.in_(model_names),
            )
            .all()
        )

        comparison = []

        for result in results:
            comparison.append(
                {
                    "model": result.model_name,
                    "provider": result.provider,
                    "latency_ms": result.latency_ms,
                    "tokens": result.total_tokens,
                    "cost": result.cost,
                    "response": result.response_text,
                    "created_at": result.created_at,
                }
            )

        return comparison