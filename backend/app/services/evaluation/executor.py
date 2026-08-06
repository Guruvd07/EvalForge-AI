import time

from app.core.model_registry import SUPPORTED_MODELS
from app.services.factory.provider_factory import ProviderFactory


class EvaluationExecutor:

    @staticmethod
    async def execute(
        prompt: str,
        model_key: str,
    ):

        model = SUPPORTED_MODELS[model_key]

        provider = ProviderFactory.get_provider(
            model["provider"]
        )

        start = time.perf_counter()

        response = await provider.generate(
            prompt=prompt,
            model=model["model_id"]
        )

        latency = round(
            (time.perf_counter() - start) * 1000
        )

        return {
            "model_name": model["display_name"],
            "provider": model["provider"],
            "response": response,
            "latency_ms": latency,
            "input_tokens": 0,
            "output_tokens": 0,
            "total_tokens": 0,
            "cost": 0.0,
        }