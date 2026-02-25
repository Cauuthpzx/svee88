"""Thêm cột password_enc vào bảng agents để hỗ trợ auto-login.

Revision ID: 006_agent_password
Revises: 005_sync_improvements
Create Date: 2026-02-26
"""

import sqlalchemy as sa
from alembic import op

revision = "006_agent_password"
down_revision = "004_partitions_2027"


def upgrade() -> None:
    op.add_column("agents", sa.Column("password_enc", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("agents", "password_enc")
