from openai import AsyncOpenAI

from app.core.settings import settings
from app.services.llm.base import BaseLLMProvider


class OpenRouterProvider(BaseLLMProvider):

    def __init__(self):

        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )

    async def generate(
        self,
        prompt: str,
        model: str = "deepseek/deepseek-chat-v3-0324"
    ) -> str:

        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content