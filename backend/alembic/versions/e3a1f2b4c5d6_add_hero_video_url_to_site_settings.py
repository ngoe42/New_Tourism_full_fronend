"""add hero_video_url to site_settings

Revision ID: e3a1f2b4c5d6
Revises: c1e2f3a4b5d6
Create Date: 2026-04-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'e3a1f2b4c5d6'
down_revision = 'c1e2f3a4b5d6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('hero_video_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'hero_video_url')
