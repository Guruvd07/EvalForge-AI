from pydantic import BaseModel


class EvaluationRequest(BaseModel):
    prompt: str
    model: str


class EvaluationResponse(BaseModel):
    model: str
    response: str