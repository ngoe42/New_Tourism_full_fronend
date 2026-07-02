"""add performance indexes for tours table

Revision ID: r1s2t3u4v5w6
Revises: q1r2s3t4u5v6
Create Date: 2026-07-02

CONCURRENTLY is used to avoid locking the tables in production.
Because CONCURRENTLY cannot run inside a transaction, we emit
COMMIT before each CREATE / DROP statement.

"""
from alembic import op


revision: str = 'r1s2t3u4v5w6'
down_revision = 'q1r2s3t4u5v6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("COMMIT")
    op.create_index('ix_tours_is_published', 'tours', ['is_published'],
                    postgresql_concurrently=True)
    op.create_index('ix_tours_is_featured', 'tours', ['is_featured'],
                    postgresql_concurrently=True)
    op.create_index('ix_tours_category', 'tours', ['category'],
                    postgresql_concurrently=True)
    op.create_index('ix_tours_is_published_category', 'tours',
                    ['is_published', 'category'],
                    postgresql_concurrently=True)
    op.create_index('ix_bookings_travel_date', 'bookings', ['travel_date'],
                    postgresql_concurrently=True)


def downgrade() -> None:
    op.execute("COMMIT")
    op.drop_index('ix_bookings_travel_date', table_name='bookings',
                  postgresql_concurrently=True)
    op.drop_index('ix_tours_is_published_category', table_name='tours',
                  postgresql_concurrently=True)
    op.drop_index('ix_tours_category', table_name='tours',
                  postgresql_concurrently=True)
    op.drop_index('ix_tours_is_featured', table_name='tours',
                  postgresql_concurrently=True)
    op.drop_index('ix_tours_is_published', table_name='tours',
                  postgresql_concurrently=True)
