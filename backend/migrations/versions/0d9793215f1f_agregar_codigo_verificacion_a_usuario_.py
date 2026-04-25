"""agregar codigo verificacion a usuario, quitar boton de confirmar de correo enviado

Revision ID: 0d9793215f1f
Revises: 4c6500be429c
Create Date: 2026-04-25 15:07:16.471286

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0d9793215f1f'
down_revision: Union[str, Sequence[str], None] = '4c6500be429c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('usuario', sa.Column('codigo_verificacion', sa.String(length=6), nullable=True))
    op.add_column('usuario', sa.Column('codigo_verificacion_expira', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('usuario', 'codigo_verificacion_expira')
    op.drop_column('usuario', 'codigo_verificacion')