"""add quality scores to evaluation results"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ADD_QUALITY_SCORES"
down_revision: Union[str, Sequence[str], None] = "71b0a8a6e4eb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "evaluation_results",
        sa.Column("relevance_score", sa.Float(), nullable=True),
    )

    op.add_column(
        "evaluation_results",
        sa.Column("correctness_score", sa.Float(), nullable=True),
    )

    op.add_column(
        "evaluation_results",
        sa.Column("coherence_score", sa.Float(), nullable=True),
    )

    op.add_column(
        "evaluation_results",
        sa.Column(
            "instruction_following_score",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "evaluation_results",
        sa.Column("overall_score", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column(
        "evaluation_results",
        "overall_score",
    )

    op.drop_column(
        "evaluation_results",
        "instruction_following_score",
    )

    op.drop_column(
        "evaluation_results",
        "coherence_score",
    )

    op.drop_column(
        "evaluation_results",
        "correctness_score",
    )

    op.drop_column(
        "evaluation_results",
        "relevance_score",
    )