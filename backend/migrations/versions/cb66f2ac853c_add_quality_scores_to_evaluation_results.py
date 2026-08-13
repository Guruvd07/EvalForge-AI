"""add quality scores to evaluation results

Revision ID: cb66f2ac853c
Revises: ADD_QUALITY_SCORES
Create Date: 2026-08-10 21:28:59.113433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb66f2ac853c'
down_revision: Union[str, Sequence[str], None] = 'ADD_QUALITY_SCORES'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
