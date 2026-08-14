"""add alt_text to tour_images

Revision ID: t1u2v3w4x5y6
Revises: s1t2u3v4w5x6
Create Date: 2026-08-14
"""
from alembic import op
import sqlalchemy as sa

revision: str = 't1u2v3w4x5y6'
down_revision = 's1t2u3v4w5x6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'tour_images',
        sa.Column('alt_text', sa.String(length=300), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('tour_images', 'alt_text')
