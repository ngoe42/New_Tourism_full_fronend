"""add email_rate_limits table

Revision ID: n1o2p3q4r5s6
Revises: m1n2o3p4q5r6
Create Date: 2026-06-28
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'n1o2p3q4r5s6'
down_revision = 'm1n2o3p4q5r6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'email_rate_limits',
        sa.Column('id', sa.Integer(), primary_key=True, index=True, nullable=False),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('action_type', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
    )
    op.create_index(
        'ix_email_rate_limits_email_created', 'email_rate_limits',
        ['email', 'created_at'],
    )


def downgrade() -> None:
    op.drop_index('ix_email_rate_limits_email_created', table_name='email_rate_limits')
    op.drop_table('email_rate_limits')
