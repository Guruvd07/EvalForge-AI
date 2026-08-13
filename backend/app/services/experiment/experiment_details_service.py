from sqlalchemy.orm import Session

from app.models.experiment import Experiment
from app.models.prompt import Prompt
from app.models.evaluation_run import EvaluationRun
from app.models.evaluation_result import EvaluationResult
from app.models.user import User


class ExperimentDetailsService:

    @staticmethod
    def get_details(
        db: Session,
        experiment_id: str,
        current_user: User,
    ):
        experiment = (
            db.query(Experiment)
            .filter(
                Experiment.id == experiment_id,
                Experiment.user_id == current_user.id,
            )
            .first()
        )

        if not experiment:
            return None

        prompts = (
            db.query(Prompt)
            .filter(Prompt.experiment_id == experiment_id)
            .all()
        )

        runs = (
            db.query(EvaluationRun)
            .filter(EvaluationRun.experiment_id == experiment_id)
            .all()
        )

        run_ids = [run.id for run in runs]

        results = (
            db.query(EvaluationResult)
            .filter(
                EvaluationResult.evaluation_run_id.in_(run_ids)
            )
            .count()
            if run_ids
            else 0
        )

        return {
            "id": experiment.id,
            "title": experiment.title,
            "description": experiment.description,
            "status": experiment.status,
            "created_at": experiment.created_at,
            "prompt_count": len(prompts),
            "run_count": len(runs),
            "result_count": results,
        }