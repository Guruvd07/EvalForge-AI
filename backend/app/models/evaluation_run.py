from datetime import datetime
from uuid import uuid4
from sqlalchemy import JSON
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    experiment_id: Mapped[str] = mapped_column(
        ForeignKey("experiments.id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="running",
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    selected_models: Mapped[list] = mapped_column(
        JSON,
        nullable=False
    )