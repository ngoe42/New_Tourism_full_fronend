"""add payment_attempts table

Revision ID: k1l2m3n4o5p6
Revises: j1k2l3m4n5o6
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa

revision: str = 'k1l2m3n4o5p6'
down_revision: str = 'j1k2l3m4n5o6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'payment_attempts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True, nullable=False),
        sa.Column('booking_id', sa.Integer(), sa.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('order_tracking_id', sa.String(255), nullable=True),
        sa.Column('merchant_reference', sa.String(255), nullable=False),
        sa.Column('redirect_url', sa.String(1000), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
    )
    op.create_index('ix_payment_attempts_booking_id', 'payment_attempts', ['booking_id'])
    op.create_index('ix_payment_attempts_order_tracking_id', 'payment_attempts', ['order_tracking_id'], unique=True)
    op.create_index('ix_payment_attempts_merchant_reference', 'payment_attempts', ['merchant_reference'])


def downgrade() -> None:
    op.drop_index('ix_payment_attempts_merchant_reference', table_name='payment_attempts')
    op.drop_index('ix_payment_attempts_order_tracking_id', table_name='payment_attempts')
    op.drop_index('ix_payment_attempts_booking_id', table_name='payment_attempts')
    op.drop_table('payment_attempts')
