"""add section images to site settings

Revision ID: a1b2c3d4e5f6
Revises: e3a1f2b4c5d6
Create Date: 2026-04-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = 'e3a1f2b4c5d6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('story_image_1', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('story_image_2', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('cta_bg_image', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'cta_bg_image')
    op.drop_column('site_settings', 'story_image_2')
    op.drop_column('site_settings', 'story_image_1')
