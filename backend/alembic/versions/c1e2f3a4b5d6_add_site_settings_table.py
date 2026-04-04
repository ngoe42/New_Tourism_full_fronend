"""add_site_settings_table

Revision ID: c1e2f3a4b5d6
Revises: 4424a3d89edd
Create Date: 2026-04-04 09:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'c1e2f3a4b5d6'
down_revision: Union[str, None] = '4424a3d89edd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'site_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('show_prices', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_site_settings_id'), 'site_settings', ['id'], unique=False)
    op.execute("INSERT INTO site_settings (show_prices, updated_at) VALUES (false, now())")


def downgrade() -> None:
    op.drop_index(op.f('ix_site_settings_id'), table_name='site_settings')
    op.drop_table('site_settings')
