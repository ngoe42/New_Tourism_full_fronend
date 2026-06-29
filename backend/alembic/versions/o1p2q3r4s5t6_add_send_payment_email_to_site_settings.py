"""add send_payment_email to site_settings

Revision ID: o1p2q3r4s5t6
Revises: n1o2p3q4r5s6
Create Date: 2026-06-29
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'o1p2q3r4s5t6'
down_revision = 'n1o2p3q4r5s6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'site_settings',
        sa.Column('send_payment_email', sa.Boolean(), nullable=False, server_default='false'),
    )


def downgrade() -> None:
    op.drop_column('site_settings', 'send_payment_email')
