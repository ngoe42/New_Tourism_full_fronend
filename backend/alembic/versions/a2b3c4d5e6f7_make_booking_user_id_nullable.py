"""make booking user_id nullable for guest bookings

Revision ID: a2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-04-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision: str = 'a2b3c4d5e6f7'
down_revision: str = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('bookings', 'user_id', nullable=True)


def downgrade() -> None:
    op.alter_column('bookings', 'user_id', nullable=False)
