"""agregar campos reset password

Revision ID: 4c6500be429c
Revises: 8c1e1e5439a2
Create Date: 2026-04-24 12:53:50.873286

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c6500be429c'
down_revision: Union[str, Sequence[str], None] = '8c1e1e5439a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('usuario', sa.Column('codigo_reset', sa.String(length=6), nullable=True))
    op.add_column('usuario', sa.Column('codigo_reset_expira', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('usuario', 'codigo_reset_expira')
    op.drop_column('usuario', 'codigo_reset')