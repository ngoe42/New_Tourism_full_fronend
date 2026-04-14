"""add show_blog to site_settings

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-14 00:00:01.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'site_settings',
        sa.Column('show_blog', sa.Boolean(), nullable=False, server_default='true'),
    )


def downgrade() -> None:
    op.drop_column('site_settings', 'show_blog')
