from sqlalchemy.orm import Session

from app.models.evaluation_run import EvaluationRun
from app.models.experiment import Experiment
from app.models.user import User


class ActivityService:

    @staticmethod
    def get_recent_activity(
        db: Session,
        current_user: User,
        limit: int = 10,
    ):
        runs = (
            db.query(EvaluationRun)
            .join(
                Experiment,
                EvaluationRun.experiment_id == Experiment.id,
            )
            .filter(
                Experiment.user_id == current_user.id
            )
            .order_by(EvaluationRun.started_at.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "run_id": run.id,
                "experiment_id": run.experiment_id,
                "status": run.status,
                "started_at": run.started_at,
                "completed_at": run.completed_at,
                "selected_models": run.selected_models,
            }
            for run in runs
        ]