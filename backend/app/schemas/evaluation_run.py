from datetime import datetime

from pydantic import BaseModel


class EvaluationRunCreate(BaseModel):
    experiment_id: str
    selected_models: list[str]


class EvaluationRunResponse(BaseModel):
    id: str
    experiment_id: str
    status: str
    started_at: datetime

    class Config:
        from_attributes = True