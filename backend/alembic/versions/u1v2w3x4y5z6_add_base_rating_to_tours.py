"""add admin-entered base rating/review count to tours

Tour.rating / review_count become derived values: the base numbers blended
with approved testimonials. Existing (seeded) numbers are kept as the base
so live tours keep showing the same figures.

Revision ID: u1v2w3x4y5z6
Revises: t1u2v3w4x5y6
Create Date: 2026-11-13
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'u1v2w3x4y5z6'
down_revision = 't1u2v3w4x5y6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tours', sa.Column('base_rating', sa.Float(), nullable=False, server_default='0'))
    op.add_column('tours', sa.Column('base_review_count', sa.Integer(), nullable=False, server_default='0'))
    op.execute("UPDATE tours SET base_rating = rating, base_review_count = review_count")
    op.execute("""
        UPDATE tours t SET
            review_count = t.base_review_count + s.n,
            rating = ROUND(CAST((t.base_rating * t.base_review_count + s.total)
                     / (t.base_review_count + s.n) AS numeric), 1)
        FROM (
            SELECT tour_id, COUNT(*) AS n, SUM(rating) AS total
            FROM testimonials
            WHERE is_approved = true AND tour_id IS NOT NULL
            GROUP BY tour_id
        ) s
        WHERE s.tour_id = t.id
    """)


def downgrade() -> None:
    op.drop_column('tours', 'base_review_count')
    op.drop_column('tours', 'base_rating')
