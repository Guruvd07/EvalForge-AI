from fastapi import APIRouter

from app.schemas.evaluation import (
    EvaluationRequest,
    EvaluationResponse,
)
from app.services.llm.openrouter_provider import OpenRouterProvider

router = APIRouter(
    prefix="/evaluate",
    tags=["Evaluation"]
)

provider = OpenRouterProvider()


@router.post(
    "",
    response_model=EvaluationResponse
)
async def evaluate(
    request: EvaluationRequest
):
    answer = await provider.generate(
        prompt=request.prompt,
        model=request.model
    )

    return EvaluationResponse(
        model=request.model,
        response=answer
    )