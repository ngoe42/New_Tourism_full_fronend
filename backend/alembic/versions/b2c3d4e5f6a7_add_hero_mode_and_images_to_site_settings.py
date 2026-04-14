"""add hero_mode and hero_images to site_settings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-14 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'site_settings',
        sa.Column('hero_mode', sa.String(20), nullable=False, server_default='video'),
    )
    op.add_column(
        'site_settings',
        sa.Column('hero_images', sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('site_settings', 'hero_images')
    op.drop_column('site_settings', 'hero_mode')
