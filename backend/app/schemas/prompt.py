from datetime import datetime

from pydantic import BaseModel


class PromptCreate(BaseModel):
    experiment_id: str
    title: str
    prompt_text: str


class PromptResponse(BaseModel):
    id: str
    experiment_id: str
    title: str
    prompt_text: str
    created_at: datetime

    class Config:
        from_attributes = True