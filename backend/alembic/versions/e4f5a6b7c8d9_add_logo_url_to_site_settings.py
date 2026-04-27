"""add logo_url to site_settings

Revision ID: e4f5a6b7c8d9
Revises: d5e6f7a8b9c0
Create Date: 2026-04-27 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'e4f5a6b7c8d9'
down_revision = 'd5e6f7a8b9c0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('logo_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'logo_url')
