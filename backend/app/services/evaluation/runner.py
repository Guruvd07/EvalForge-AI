from app.services.evaluation.executor import EvaluationExecutor


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
                    prompt.prompt_text,
                    model,
                )

                result["prompt_id"] = prompt.id

                results.append(result)

        return results