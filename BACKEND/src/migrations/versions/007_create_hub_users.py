"""Tạo bảng hub_users cho hệ thống phân quyền HUBER.

Revision ID: 007_hub_users
Revises: 006_agent_password
Create Date: 2026-02-26
"""

import sqlalchemy as sa
from alembic import op

revision = "007_hub_users"
down_revision = "006_agent_password"


def upgrade() -> None:
    op.create_table(
        "hub_users",
        sa.Column("id", sa.Integer, autoincrement=True, primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("email", sa.String(100), nullable=True),
        sa.Column(
            "role",
            sa.String(20),
            nullable=False,
            server_default="USERHUB",
            comment="ADMINHUB | MODHUB | USERHUB",
        ),
        sa.Column(
            "permissions",
            sa.JSON,
            nullable=True,
            comment='Override per-user: {"routes": [...], "actions": [...]}',
        ),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_hub_users_username", "hub_users", ["username"])
    op.create_index("ix_hub_users_role", "hub_users", ["role"])


def downgrade() -> None:
    op.drop_index("ix_hub_users_role", "hub_users")
    op.drop_index("ix_hub_users_username", "hub_users")
    op.drop_table("hub_users")
