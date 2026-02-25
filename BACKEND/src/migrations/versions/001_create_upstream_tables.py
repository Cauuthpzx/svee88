"""Create upstream non-partitioned tables.

Revision ID: 001_upstream
Revises:
Create Date: 2026-02-24
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "001_upstream"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- sync_metadata ---
    op.create_table(
        "sync_metadata",
        sa.Column("id", sa.Integer, autoincrement=True, primary_key=True),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("endpoint", sa.String(50), nullable=False),
        sa.Column("last_sync_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default="1970-01-01"),
        sa.Column("last_sync_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("sync_status", sa.String(20), nullable=False, server_default="idle"),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("sync_params", postgresql.JSONB, nullable=True),
        sa.Column("created_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("agent_id", "endpoint", name="uq_sync_agent_endpoint"),
    )

    # --- lottery_series ---
    op.create_table(
        "lottery_series",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
    )

    # --- lottery_games ---
    op.create_table(
        "lottery_games",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("series_id", sa.Integer, sa.ForeignKey("lottery_series.id"), nullable=False),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
    )
    op.create_index("idx_lottery_games_series", "lottery_games", ["series_id"])

    # --- members ---
    op.create_table(
        "members",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("user_parent", sa.Integer, nullable=True),
        sa.Column("user_tree", postgresql.JSONB, nullable=True),
        sa.Column("level", sa.SmallInteger, nullable=False, server_default="0"),
        sa.Column("type", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("group_id", sa.Integer, nullable=False, server_default="0"),
        sa.Column("status", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("login_ip", sa.String(45), nullable=True),
        sa.Column("useragent", sa.Text, nullable=True),
        sa.Column("device", sa.String(50), nullable=True),
        sa.Column("login_time", sa.DateTime, nullable=True),
        sa.Column("register_ip", sa.String(45), nullable=True),
        sa.Column("register_time", sa.DateTime, nullable=False),
        sa.Column("truename", sa.String(100), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("email_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("remark", sa.Text, nullable=True),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("invite_code", sa.String(50), nullable=True),
        sa.Column("phone_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("phone_verified_time", sa.DateTime, nullable=True),
        sa.Column("agent_type", sa.SmallInteger, nullable=False, server_default="0"),
        sa.Column("is_tester", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("first_deposit_time", sa.DateTime, nullable=True),
        sa.Column("create_time", sa.DateTime, nullable=False),
        sa.Column("update_time", sa.DateTime, nullable=False),
        sa.Column("money", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("deposit_times", sa.Integer, nullable=False, server_default="0"),
        sa.Column("deposit_money", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("withdrawal_times", sa.Integer, nullable=False, server_default="0"),
        sa.Column("withdrawal_money", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.UniqueConstraint("agent_id", "username", name="uq_members_agent_username"),
    )
    op.create_index("idx_members_username", "members", ["username"])
    op.create_index("idx_members_money", "members", ["money"])
    op.create_index("idx_members_login_time", "members", ["login_time"])
    op.create_index("idx_members_register_time", "members", ["register_time"])
    op.create_index("idx_members_user_parent", "members", ["user_parent"])
    op.create_index("idx_members_agent_status", "members", ["agent_id", "status"])
    # Partial indexes via raw SQL
    op.execute("CREATE INDEX idx_members_status ON members (status) WHERE status != 1")
    op.execute("CREATE INDEX idx_members_invite_code ON members (invite_code) WHERE invite_code IS NOT NULL")

    # --- invite_list ---
    op.create_table(
        "invite_list",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("uid", sa.Integer, nullable=False),
        sa.Column("invite_code", sa.String(50), nullable=False),
        sa.Column("group_id", sa.Integer, nullable=False, server_default="0"),
        sa.Column("user_type", sa.String(50), nullable=True),
        sa.Column("rebate_arr", postgresql.JSONB, nullable=True),
        sa.Column("reg_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("remark", sa.Text, nullable=True),
        sa.Column("create_time", sa.DateTime, nullable=False),
        sa.Column("update_time", sa.DateTime, nullable=False),
        sa.Column("recharge_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("first_recharge_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("register_recharge_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("scope_reg_count", sa.Integer, nullable=False, server_default="0"),
        sa.UniqueConstraint("agent_id", "invite_code", name="uq_invite_agent_code"),
    )
    op.create_index("idx_invite_list_uid", "invite_list", ["uid"])

    # --- bank_list ---
    op.create_table(
        "bank_list",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1"),
        sa.Column("is_default", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("bank", sa.String(100), nullable=False),
        sa.Column("branch", sa.String(255), nullable=True),
        sa.Column("card_number", sa.String(30), nullable=True),
        sa.Column("create_time", sa.DateTime, nullable=False),
    )

    # --- report_lottery ---
    op.create_table(
        "report_lottery",
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1", primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, primary_key=True),
        sa.Column("uid", sa.Integer, nullable=False, primary_key=True),
        sa.Column("lottery_id", sa.SmallInteger, nullable=False, primary_key=True),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("lottery_name", sa.String(100), nullable=False),
        sa.Column("bet_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("bet_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("valid_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("rebate_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("result", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("win_lose", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("prize", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("synced_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("idx_report_lottery_date", "report_lottery", ["report_date"])
    op.create_index("idx_report_lottery_uid_date", "report_lottery", ["uid", "report_date"])
    op.create_index("idx_report_lottery_username_date", "report_lottery", ["username", "report_date"])
    op.create_index("idx_report_lottery_lottery_date", "report_lottery", ["lottery_id", "report_date"])

    # --- report_funds ---
    op.create_table(
        "report_funds",
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1", primary_key=True),
        sa.Column("id", sa.Integer, nullable=False, primary_key=True),
        sa.Column("uid", sa.Integer, nullable=False),
        sa.Column("user_parent", sa.Integer, nullable=True),
        sa.Column("report_date", sa.Date, nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("deposit_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("deposit_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("withdrawal_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("withdrawal_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("charge_fee", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("agent_commission", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("promotion", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("third_rebate", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("third_activity_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("synced_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("agent_id", "report_date", "uid", name="uq_report_funds_agent_date_uid"),
    )
    op.create_index("idx_report_funds_date", "report_funds", ["report_date"])
    op.create_index("idx_report_funds_uid_date", "report_funds", ["uid", "report_date"])
    op.create_index("idx_report_funds_username_date", "report_funds", ["username", "report_date"])

    # --- report_third_game ---
    op.create_table(
        "report_third_game",
        sa.Column("agent_id", sa.SmallInteger, nullable=False, server_default="1", primary_key=True),
        sa.Column("report_date", sa.Date, nullable=False, primary_key=True),
        sa.Column("uid", sa.Integer, nullable=False, primary_key=True),
        sa.Column("platform_id", sa.Integer, nullable=False, primary_key=True),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("platform_id_name", sa.String(50), nullable=False),
        sa.Column("t_bet_amount", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("t_bet_times", sa.Integer, nullable=False, server_default="0"),
        sa.Column("t_turnover", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("t_prize", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("t_win_lose", sa.Numeric(15, 4), nullable=False, server_default="0"),
        sa.Column("synced_at", postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("idx_report_third_date", "report_third_game", ["report_date"])
    op.create_index("idx_report_third_uid_date", "report_third_game", ["uid", "report_date"])
    op.create_index("idx_report_third_username_date", "report_third_game", ["username", "report_date"])
    op.create_index("idx_report_third_platform_date", "report_third_game", ["platform_id", "report_date"])


def downgrade() -> None:
    op.drop_table("report_third_game")
    op.drop_table("report_funds")
    op.drop_table("report_lottery")
    op.drop_table("bank_list")
    op.drop_table("invite_list")
    op.drop_table("members")
    op.drop_table("lottery_games")
    op.drop_table("lottery_series")
    op.drop_table("sync_metadata")
