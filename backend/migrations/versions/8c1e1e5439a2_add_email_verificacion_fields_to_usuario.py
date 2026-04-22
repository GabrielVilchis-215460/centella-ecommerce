"""add email verificacion fields to usuario

Revision ID: 8c1e1e5439a2
Revises: 5df12abed55b
Create Date: 2026-04-15 16:32:39.358141

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c1e1e5439a2'
down_revision: Union[str, Sequence[str], None] = '5df12abed55b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('usuario', sa.Column('email_verificado', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('usuario', sa.Column('token_verificacion', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('usuario', 'token_verificacion')
    op.drop_column('usuario', 'email_verificado')