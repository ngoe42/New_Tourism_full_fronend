"""add is_superadmin to users

Revision ID: h1i2j3k4l5m6
Revises: d5e6f7a8b9c0
Create Date: 2026-04-23
"""
from alembic import op
import sqlalchemy as sa

revision = 'h1i2j3k4l5m6'
down_revision = 'd5e6f7a8b9c0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('is_superadmin', sa.Boolean(), server_default='false', nullable=False),
    )


def downgrade() -> None:
    op.drop_column('users', 'is_superadmin')
