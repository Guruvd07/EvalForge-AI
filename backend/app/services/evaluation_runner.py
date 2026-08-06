from sqlalchemy.orm import Session

from app.models.prompt import Prompt
from app.services.evaluation_engine import EvaluationEngine


class EvaluationRunner:

    @staticmethod
    async def run(
        db: Session,
        prompts: list[Prompt],
        selected_models: list[str]
    ):

        results = []

        for prompt in prompts:

            for model in selected_models:

                result = await EvaluationEngine.evaluate_prompt(
                    prompt=prompt.prompt_text,
                    model_key=model
                )

                results.append(result)

        return results