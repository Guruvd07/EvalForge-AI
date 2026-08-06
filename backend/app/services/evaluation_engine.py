import time
from sqlalchemy.orm import Session

from app.core.model_registry import SUPPORTED_MODELS
from app.services.factory.provider_factory import ProviderFactory


class EvaluationEngine:

    @staticmethod
    async def evaluate_prompt(
        prompt: str,
        model_key: str
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

        latency = (
            time.perf_counter() - start
        ) * 1000

        return {
            "response": response,
            "latency_ms": round(latency),
            "provider": model["provider"],
            "model_name": model["display_name"]
        }