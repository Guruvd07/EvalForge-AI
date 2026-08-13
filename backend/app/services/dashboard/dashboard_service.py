from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.experiment import Experiment
from app.models.prompt import Prompt
from app.models.evaluation_run import EvaluationRun
from app.models.evaluation_result import EvaluationResult
from app.models.user import User


class DashboardService:

    @staticmethod
    def get_dashboard_stats(
        db: Session,
        current_user: User,
    ):
        # --------------------------------------------------------
        # User-owned experiments
        # --------------------------------------------------------

        user_experiment_ids = (
            db.query(Experiment.id)
            .filter(
                Experiment.user_id == current_user.id
            )
            .subquery()
        )

        total_experiments = (
            db.query(func.count(Experiment.id))
            .filter(
                Experiment.user_id == current_user.id
            )
            .scalar()
            or 0
        )

        # --------------------------------------------------------
        # User-owned prompts
        # --------------------------------------------------------

        total_prompts = (
            db.query(func.count(Prompt.id))
            .filter(
                Prompt.experiment_id.in_(user_experiment_ids)
            )
            .scalar()
            or 0
        )

        # --------------------------------------------------------
        # User-owned evaluation runs
        # --------------------------------------------------------

        total_runs = (
            db.query(func.count(EvaluationRun.id))
            .filter(
                EvaluationRun.experiment_id.in_(user_experiment_ids)
            )
            .scalar()
            or 0
        )

        # --------------------------------------------------------
        # User-owned evaluation results
        # --------------------------------------------------------

        user_run_ids = (
            db.query(EvaluationRun.id)
            .filter(
                EvaluationRun.experiment_id.in_(user_experiment_ids)
            )
            .subquery()
        )

        total_results = (
            db.query(func.count(EvaluationResult.id))
            .filter(
                EvaluationResult.evaluation_run_id.in_(user_run_ids)
            )
            .scalar()
            or 0
        )

        # --------------------------------------------------------
        # User-specific metrics
        # --------------------------------------------------------

        avg_latency = (
            db.query(func.avg(EvaluationResult.latency_ms))
            .filter(
                EvaluationResult.evaluation_run_id.in_(user_run_ids)
            )
            .scalar()
            or 0
        )

        avg_tokens = (
            db.query(func.avg(EvaluationResult.total_tokens))
            .filter(
                EvaluationResult.evaluation_run_id.in_(user_run_ids)
            )
            .scalar()
            or 0
        )

        avg_cost = (
            db.query(func.avg(EvaluationResult.cost))
            .filter(
                EvaluationResult.evaluation_run_id.in_(user_run_ids)
            )
            .scalar()
            or 0
        )

        total_models_executed = total_results

        return {
            "total_experiments": total_experiments,
            "total_prompts": total_prompts,
            "total_runs": total_runs,
            "total_results": total_results,
            "total_models_executed": total_models_executed,
            "avg_latency_ms": round(avg_latency, 2),
            "avg_tokens": round(avg_tokens, 2),
            "avg_cost": round(avg_cost, 6),
        }