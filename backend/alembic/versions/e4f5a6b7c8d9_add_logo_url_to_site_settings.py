"""add logo_url to site_settings

Revision ID: e4f5a6b7c8d9
Revises: h1i2j3k4l5m6
Create Date: 2026-04-27 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'e4f5a6b7c8d9'
down_revision = 'h1i2j3k4l5m6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('logo_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'logo_url')
