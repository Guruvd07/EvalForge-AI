from sqlalchemy.orm import Session

from app.models.prompt import Prompt
from app.services.evaluation.runner import EvaluationRunner
from app.services.evaluation.repository import (
    EvaluationRepository,
)


class EvaluationService:

    @staticmethod
    async def evaluate(
        db: Session,
        evaluation_run_id: str,
        experiment_id: str,
        selected_models: list[str],
    ):

        prompts = (
            db.query(Prompt)
            .filter(
                Prompt.experiment_id == experiment_id
            )
            .all()
        )

        results = await EvaluationRunner.run(
            prompts,
            selected_models,
        )

        EvaluationRepository.save_results(
            db,
            evaluation_run_id,
            results,
        )

        return results