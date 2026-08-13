from app.services.evaluation.executor import EvaluationExecutor
from app.services.evaluation.quality_evaluator import QualityEvaluator


class EvaluationRunner:

    @staticmethod
    async def run(
        prompts,
        selected_models,
    ):

        results = []

        for prompt in prompts:

            for model in selected_models:

                result = await EvaluationExecutor.execute(
                    prompt=prompt.prompt_text,
                    model_key=model,
                )

                quality = await QualityEvaluator.evaluate(
                    prompt=prompt.prompt_text,
                    response=result["response"],
                )

                result["prompt_id"] = prompt.id

                result["relevance_score"] = quality["relevance"]
                result["correctness_score"] = quality["correctness"]
                result["coherence_score"] = quality["coherence"]
                result["instruction_following_score"] = quality[
                    "instruction_following"
                ]
                result["overall_score"] = quality["overall"]

                results.append(result)

        return results