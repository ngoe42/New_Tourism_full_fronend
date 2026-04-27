"""add wonders section images to site_settings

Revision ID: i1j2k3l4m5n6
Revises: f5a6b7c8d9e0
Create Date: 2026-04-27 18:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'i1j2k3l4m5n6'
down_revision = 'f5a6b7c8d9e0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('wonders_kilimanjaro_image', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('wonders_safari_image', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'wonders_safari_image')
    op.drop_column('site_settings', 'wonders_kilimanjaro_image')
