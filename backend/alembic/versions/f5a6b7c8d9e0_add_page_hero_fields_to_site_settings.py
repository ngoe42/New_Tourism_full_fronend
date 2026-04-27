"""add tours and routes page hero fields to site_settings

Revision ID: f5a6b7c8d9e0
Revises: e4f5a6b7c8d9
Create Date: 2026-04-27 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'f5a6b7c8d9e0'
down_revision = 'e4f5a6b7c8d9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('site_settings', sa.Column('tours_hero_label',       sa.String(200), nullable=True))
    op.add_column('site_settings', sa.Column('tours_hero_title',       sa.String(300), nullable=True))
    op.add_column('site_settings', sa.Column('tours_hero_description', sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('tours_hero_image',       sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('routes_hero_title',      sa.String(300), nullable=True))
    op.add_column('site_settings', sa.Column('routes_hero_description',sa.String(500), nullable=True))
    op.add_column('site_settings', sa.Column('routes_hero_image',      sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('site_settings', 'routes_hero_image')
    op.drop_column('site_settings', 'routes_hero_description')
    op.drop_column('site_settings', 'routes_hero_title')
    op.drop_column('site_settings', 'tours_hero_image')
    op.drop_column('site_settings', 'tours_hero_description')
    op.drop_column('site_settings', 'tours_hero_title')
    op.drop_column('site_settings', 'tours_hero_label')
