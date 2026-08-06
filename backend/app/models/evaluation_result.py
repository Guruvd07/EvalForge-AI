from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    evaluation_run_id: Mapped[str] = mapped_column(
        ForeignKey("evaluation_runs.id"),
        nullable=False
    )

    prompt_id: Mapped[str] = mapped_column(
        ForeignKey("prompts.id"),
        nullable=False
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    response_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    latency_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    input_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    output_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    total_tokens: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    cost: Mapped[float] = mapped_column(
        Float,
        default=0.0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )