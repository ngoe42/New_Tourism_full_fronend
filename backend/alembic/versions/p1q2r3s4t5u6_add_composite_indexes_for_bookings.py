"""add composite indexes for booking queries

Revision ID: p1q2r3s4t5u6
Revises: o1p2q3r4s5t6
Create Date: 2026-06-29

"""
from alembic import op


revision: str = 'p1q2r3s4t5u6'
down_revision = 'o1p2q3r4s5t6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        'ix_bookings_tour_date_status',
        'bookings',
        ['tour_id', 'travel_date', 'status'],
        postgresql_include=['created_at'],
    )
    op.create_index(
        'ix_bookings_status_created_at',
        'bookings',
        ['status', 'created_at'],
    )


def downgrade() -> None:
    op.drop_index('ix_bookings_status_created_at', table_name='bookings')
    op.drop_index('ix_bookings_tour_date_status', table_name='bookings')
