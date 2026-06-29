"""add version column to bookings for optimistic locking

Revision ID: q1r2s3t4u5v6
Revises: p1q2r3s4t5u6
Create Date: 2026-06-29

"""
from alembic import op
import sqlalchemy as sa


revision: str = 'q1r2s3t4u5v6'
down_revision = 'p1q2r3s4t5u6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'bookings',
        sa.Column('version', sa.Integer(), nullable=False, server_default=sa.text('1')),
    )


def downgrade() -> None:
    op.drop_column('bookings', 'version')
