from pydantic import BaseModel


class EvaluationRunCreate(BaseModel):

    experiment_id: str

    selected_models: list[str]


class EvaluationRunResponse(BaseModel):

    run_id: str

    status: str