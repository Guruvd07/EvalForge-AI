from datetime import datetime

from pydantic import BaseModel, Field


class ExperimentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str | None = None


class ExperimentResponse(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True