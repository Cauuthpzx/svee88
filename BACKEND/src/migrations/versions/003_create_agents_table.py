"""Create agents table for multi-agent upstream management.

Revision ID: 003_agents
Revises: 002_partitioned
Create Date: 2026-02-25
"""

import sqlalchemy as sa
from alembic import op

revision = "003_agents"
down_revision = "002_partitioned"


def upgrade() -> None:
    op.create_table(
        "agents",
        sa.Column("id", sa.Integer, autoincrement=True, primary_key=True),
        sa.Column("owner", sa.String(100), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("base_url", sa.String(255), nullable=False),
        sa.Column("cookie", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("agents")
