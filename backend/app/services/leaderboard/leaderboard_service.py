from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult
from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class LeaderboardService:

    @staticmethod
    def get_leaderboard(
        db: Session,
        current_user: User,
    ):
        rows = (
            db.query(
                EvaluationResult.model_name,
                EvaluationResult.provider,
                func.count(EvaluationResult.id).label("evaluations"),
                func.avg(EvaluationResult.latency_ms).label("avg_latency"),
                func.avg(EvaluationResult.total_tokens).label("avg_tokens"),
                func.avg(EvaluationResult.cost).label("avg_cost"),
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
            .group_by(
                EvaluationResult.model_name,
                EvaluationResult.provider,
            )
            .order_by(func.avg(EvaluationResult.latency_ms))
            .all()
        )

        leaderboard = []

        for rank, row in enumerate(rows, start=1):
            leaderboard.append(
                {
                    "rank": rank,
                    "model": row.model_name,
                    "provider": row.provider,
                    "evaluations": row.evaluations,
                    "avg_latency_ms": round(row.avg_latency or 0, 2),
                    "avg_tokens": round(row.avg_tokens or 0, 2),
                    "avg_cost": round(row.avg_cost or 0, 6),
                }
            )

        return leaderboard