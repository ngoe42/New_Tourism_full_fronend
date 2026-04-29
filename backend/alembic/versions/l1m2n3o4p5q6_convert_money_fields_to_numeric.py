"""convert money fields to numeric(12,2)

Revision ID: l1m2n3o4p5q6
Revises: k1l2m3n4o5p6
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'l1m2n3o4p5q6'
down_revision: str = 'k1l2m3n4o5p6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        'tours', 'price',
        type_=sa.Numeric(12, 2),
        existing_type=sa.Float(),
        postgresql_using='price::NUMERIC(12,2)',
    )
    op.alter_column(
        'bookings', 'total_price',
        type_=sa.Numeric(12, 2),
        existing_type=sa.Float(),
        postgresql_using='total_price::NUMERIC(12,2)',
    )
    op.alter_column(
        'routes', 'price',
        type_=sa.Numeric(12, 2),
        existing_type=sa.Float(),
        postgresql_using='price::NUMERIC(12,2)',
    )
    op.alter_column(
        'trip_plans', 'quoted_price',
        type_=sa.Numeric(12, 2),
        existing_type=sa.Float(),
        existing_nullable=True,
        postgresql_using='quoted_price::NUMERIC(12,2)',
    )


def downgrade() -> None:
    op.alter_column(
        'trip_plans', 'quoted_price',
        type_=sa.Float(),
        existing_type=sa.Numeric(12, 2),
        existing_nullable=True,
        postgresql_using='quoted_price::FLOAT',
    )
    op.alter_column(
        'routes', 'price',
        type_=sa.Float(),
        existing_type=sa.Numeric(12, 2),
        postgresql_using='price::FLOAT',
    )
    op.alter_column(
        'bookings', 'total_price',
        type_=sa.Float(),
        existing_type=sa.Numeric(12, 2),
        postgresql_using='total_price::FLOAT',
    )
    op.alter_column(
        'tours', 'price',
        type_=sa.Float(),
        existing_type=sa.Numeric(12, 2),
        postgresql_using='price::FLOAT',
    )
