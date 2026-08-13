"""add quality scores to evaluation results

Revision ID: 13df2687d316
Revises: cb66f2ac853c
Create Date: 2026-08-10 21:29:46.048669

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '13df2687d316'
down_revision: Union[str, Sequence[str], None] = 'cb66f2ac853c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
