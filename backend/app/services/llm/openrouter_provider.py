import time

from openai import AsyncOpenAI

from app.core.settings import settings
from app.services.llm.base import BaseLLMProvider


class OpenRouterProvider(BaseLLMProvider):

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )

    async def generate(
        self,
        prompt: str,
        model: str = "deepseek/deepseek-chat-v3-0324",
    ):
        start = time.perf_counter()

        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=512,
                temperature=0,
            )

        except Exception as exc:
            raise RuntimeError(
                f"OpenRouter request failed for model '{model}': {exc}"
            ) from exc

        latency_ms = int((time.perf_counter() - start) * 1000)

        # ---------------------------------------------------------
        # Validate response
        # ---------------------------------------------------------

        if response is None:
            raise RuntimeError(
                f"OpenRouter returned no response for model '{model}'."
            )

        choices = getattr(response, "choices", None)

        if not choices:
            # Try to extract useful information from the response.
            response_dump = repr(response)

            raise RuntimeError(
                f"OpenRouter returned no choices for model '{model}'. "
                f"Response: {response_dump}"
            )

        choice = choices[0]

        message = getattr(choice, "message", None)

        if message is None:
            raise RuntimeError(
                f"OpenRouter returned a choice without a message "
                f"for model '{model}'. Response: {repr(response)}"
            )

        content = getattr(message, "content", None)

        # ---------------------------------------------------------
        # Some models/providers can return a response where content
        # is None. Never allow this to become a TypeError later.
        # ---------------------------------------------------------

        if content is None:
            # Some responses may contain tool calls or other fields.
            tool_calls = getattr(message, "tool_calls", None)

            if tool_calls:
                content = ""

            else:
                raise RuntimeError(
                    f"OpenRouter returned an empty message content "
                    f"for model '{model}'. Response: {repr(response)}"
                )

        content = str(content).strip()

        if not content:
            raise RuntimeError(
                f"OpenRouter returned an empty response for model '{model}'."
            )

        # ---------------------------------------------------------
        # Token usage
        # ---------------------------------------------------------

        usage = getattr(response, "usage", None)

        input_tokens = (
            getattr(usage, "prompt_tokens", 0)
            if usage
            else 0
        )

        output_tokens = (
            getattr(usage, "completion_tokens", 0)
            if usage
            else 0
        )

        total_tokens = (
            getattr(usage, "total_tokens", 0)
            if usage
            else 0
        )

        # ---------------------------------------------------------
        # Return normalized provider response
        # ---------------------------------------------------------

        return {
            "response_text": content,
            "latency_ms": latency_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost": 0.0,
        }