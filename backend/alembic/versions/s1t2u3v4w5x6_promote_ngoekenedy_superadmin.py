"""promote ngoekenedy@gmail.com to permanent superadmin

Revision ID: s1t2u3v4w5x6
Revises: r1s2t3u4v5w6
Create Date: 2026-08-07

Idempotent: safe to run on a DB that already has this user flagged as
superadmin, or on a DB where the email does not yet exist (the UPDATE
affects 0 rows and the INSERT uses ON CONFLICT DO NOTHING).
"""
from alembic import op
import sqlalchemy as sa

revision: str = 's1t2u3v4w5x6'
down_revision: str = 'r1s2t3u4v5w6'
branch_labels = None
depends_on = None

SUPERADMIN_EMAIL = 'ngoekenedy@gmail.com'


def upgrade() -> None:
    # Case 1: email already exists → make it superadmin, ensure active.
    op.execute(
        sa.text(
            "UPDATE users "
            "SET is_superadmin = TRUE, is_active = TRUE "
            "WHERE email = :email"
        ).bindparams(email=SUPERADMIN_EMAIL)
    )

    # Case 2: email does not exist yet → create a placeholder row.
    # The startup seeder (_seed_admin in main.py) will overwrite the
    # password and assign the correct role_id on first boot.
    op.execute(
        sa.text(
            "INSERT INTO users "
            "(email, name, hashed_password, role, is_active, is_superadmin, created_at, updated_at) "
            "VALUES (:email, 'Kenedy', 'PENDING_SEED', 'admin', TRUE, TRUE, NOW(), NOW()) "
            "ON CONFLICT (email) DO NOTHING"
        ).bindparams(email=SUPERADMIN_EMAIL)
    )


def downgrade() -> None:
    # Revoke superadmin only — do not delete the user.
    op.execute(
        sa.text(
            "UPDATE users SET is_superadmin = FALSE WHERE email = :email"
        ).bindparams(email=SUPERADMIN_EMAIL)
    )
