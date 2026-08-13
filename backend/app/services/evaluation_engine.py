from app.core.model_registry import SUPPORTED_MODELS
from app.services.factory.provider_factory import ProviderFactory


class EvaluationEngine:

    @staticmethod
    async def evaluate_prompt(
        prompt: str,
        model_key: str,
    ):

        model = SUPPORTED_MODELS[model_key]

        provider = ProviderFactory.get_provider(
            model["provider"]
        )

        result = await provider.generate(
            prompt=prompt,
            model=model["model_id"],
        )
        
        print("DEBUG RESULT:", result)

        print(result)   # Temporary debug

        return {
            "response": result["response_text"],
            "latency_ms": result["latency_ms"],
            "input_tokens": result["input_tokens"],
            "output_tokens": result["output_tokens"],
            "total_tokens": result["total_tokens"],
            "cost": result["cost"],
            "provider": model["provider"],
            "model_name": model["display_name"],
        }