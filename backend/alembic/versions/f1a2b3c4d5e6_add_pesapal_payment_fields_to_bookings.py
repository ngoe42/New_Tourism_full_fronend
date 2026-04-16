"""add pesapal payment fields to bookings

Revision ID: f1a2b3c4d5e6
Revises: c3d4e5f6a7b8
Create Date: 2026-04-15 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision: str = 'f1a2b3c4d5e6'
down_revision: str = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('bookings', sa.Column('pesapal_order_tracking_id', sa.String(255), nullable=True))
    op.add_column('bookings', sa.Column('pesapal_merchant_reference', sa.String(255), nullable=True))
    op.add_column('bookings', sa.Column('payment_status', sa.String(50), nullable=True))
    op.add_column('bookings', sa.Column('payment_redirect_url', sa.String(1000), nullable=True))
    op.create_index(
        'ix_bookings_pesapal_order_tracking_id',
        'bookings',
        ['pesapal_order_tracking_id'],
    )


def downgrade() -> None:
    op.drop_index('ix_bookings_pesapal_order_tracking_id', table_name='bookings')
    op.drop_column('bookings', 'payment_redirect_url')
    op.drop_column('bookings', 'payment_status')
    op.drop_column('bookings', 'pesapal_merchant_reference')
    op.drop_column('bookings', 'pesapal_order_tracking_id')
