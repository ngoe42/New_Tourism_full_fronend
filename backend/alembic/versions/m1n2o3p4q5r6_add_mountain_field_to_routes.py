"""add mountain field to routes

Revision ID: m1n2o3p4q5r6
Revises: l1m2n3o4p5q6
Create Date: 2026-04-30
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'm1n2o3p4q5r6'
down_revision = 'l1m2n3o4p5q6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('routes', sa.Column(
        'mountain', sa.String(length=50), nullable=False,
        server_default='kilimanjaro'
    ))
    op.create_index('ix_routes_mountain', 'routes', ['mountain'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_routes_mountain', table_name='routes')
    op.drop_column('routes', 'mountain')
