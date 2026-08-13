from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class QualityService:

    @staticmethod
    def calculate_scores(
        db: Session,
        current_user: User,
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
                Experiment.user_id == current_user.id
            )
            .all()
        )

        quality = []

        for result in results:

            score = 100

            if result.latency_ms > 10000:
                score -= 20

            if result.total_tokens > 500:
                score -= 10

            score = max(score, 0)

            quality.append(
                {
                    "model": result.model_name,
                    "provider": result.provider,
                    "quality_score": score,
                    "latency_ms": result.latency_ms,
                    "tokens": result.total_tokens,
                }
            )

        return quality