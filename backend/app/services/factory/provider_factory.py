from app.services.llm.openrouter_provider import OpenRouterProvider


class ProviderFactory:

    @staticmethod
    def get_provider(provider: str):

        if provider == "openrouter":
            return OpenRouterProvider()

        raise ValueError(f"Unsupported provider: {provider}")