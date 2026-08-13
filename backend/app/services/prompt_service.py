from typing import List

from sqlalchemy.orm import Session

from app.models.prompt import Prompt
from app.models.experiment import Experiment
from app.models.user import User
from app.schemas.prompt import PromptCreate


class PromptService:

    @staticmethod
    def create_prompt(
        db: Session,
        prompt_data: PromptCreate,
        current_user: User
    ) -> Prompt:

        # Check experiment exists and belongs to current user
        experiment = (
            db.query(Experiment)
            .filter(
                Experiment.id == prompt_data.experiment_id,
                Experiment.user_id == current_user.id
            )
            .first()
        )

        if not experiment:
            raise ValueError("Experiment not found")

        prompt = Prompt(
            experiment_id=prompt_data.experiment_id,
            title=prompt_data.title,
            prompt_text=prompt_data.prompt_text
        )

        db.add(prompt)
        db.commit()
        db.refresh(prompt)

        return prompt

    @staticmethod
    def get_prompts_by_experiment(
        db: Session,
        experiment_id: str,
        current_user: User
    ) -> List[Prompt]:

        # Check experiment exists and belongs to current user
        experiment = (
            db.query(Experiment)
            .filter(
                Experiment.id == experiment_id,
                Experiment.user_id == current_user.id
            )
            .first()
        )

        if not experiment:
            raise ValueError("Experiment not found")

        # Get all prompts for this experiment
        prompts = (
            db.query(Prompt)
            .filter(
                Prompt.experiment_id == experiment_id
            )
            .order_by(Prompt.created_at.desc())
            .all()
        )

        return prompts