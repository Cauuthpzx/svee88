"""Create partitioned tables for high-volume data.

bet_order: ~224K records/day, partitioned by bet_time monthly
bet_lottery: ~52K records/day, partitioned by create_time monthly
deposit_withdrawal: ~18K records/week, partitioned by create_time monthly

Revision ID: 002_partitioned
Revises: 001_upstream
Create Date: 2026-02-24
"""

from alembic import op

revision = "002_partitioned"
down_revision = "001_upstream"
branch_labels = None
depends_on = None


def _month_range(year_start: int, month_start: int, year_end: int, month_end: int):
    """Generate (year, month) tuples for partition creation."""
    y, m = year_start, month_start
    while (y, m) <= (year_end, month_end):
        yield y, m
        m += 1
        if m > 12:
            m = 1
            y += 1


def _create_partitions(table: str, col: str, year_start: int, month_start: int, year_end: int, month_end: int):
    """Create monthly partitions for a partitioned table."""
    for y, m in _month_range(year_start, month_start, year_end, month_end):
        ny, nm = (y, m + 1) if m < 12 else (y + 1, 1)
        part_name = f"{table}_{y}_{m:02d}"
        op.execute(
            f"CREATE TABLE IF NOT EXISTS {part_name} PARTITION OF {table} "
            f"FOR VALUES FROM ('{y}-{m:02d}-01') TO ('{ny}-{nm:02d}-01')"
        )


def upgrade() -> None:
    # ===== deposit_withdrawal (partitioned by create_time) =====
    op.execute("""
        CREATE TABLE deposit_withdrawal (
            id              BIGINT NOT NULL,
            create_time     TIMESTAMP NOT NULL,
            agent_id        SMALLINT NOT NULL DEFAULT 1,
            serial_no       VARCHAR(50) NOT NULL,
            uid             INTEGER NOT NULL,
            user_parent     INTEGER,
            user_tree       JSONB,
            group_id        INTEGER NOT NULL DEFAULT 0,
            amount          NUMERIC(15,4) NOT NULL,
            true_amount     NUMERIC(15,4) NOT NULL,
            firm_fee        NUMERIC(15,4) NOT NULL DEFAULT 0,
            user_fee        NUMERIC(15,4) NOT NULL DEFAULT 0,
            rebate          NUMERIC(15,4),
            name            VARCHAR(255),
            bank_id         INTEGER NOT NULL DEFAULT 0,
            branch          VARCHAR(255),
            account         VARCHAR(50),
            transfer_time   TIMESTAMP,
            remark          TEXT,
            user_remark     VARCHAR(255),
            status          VARCHAR(50) NOT NULL,
            prostatus       SMALLINT NOT NULL,
            operator        INTEGER NOT NULL DEFAULT 0,
            prize_amount    NUMERIC(15,4) NOT NULL DEFAULT 0,
            activity_id     INTEGER NOT NULL DEFAULT 0,
            extra           JSONB,
            category_id     SMALLINT NOT NULL,
            merchant_id     INTEGER NOT NULL DEFAULT 0,
            pay_type        SMALLINT NOT NULL DEFAULT 0,
            trade_id        VARCHAR(50),
            is_tester       BOOLEAN NOT NULL DEFAULT FALSE,
            success_time    TIMESTAMP,
            review_time     TIMESTAMP,
            transfer_record TEXT,
            currency        SMALLINT NOT NULL DEFAULT 1,
            type            VARCHAR(20) NOT NULL,
            username        VARCHAR(50) NOT NULL,
            update_time     TIMESTAMP NOT NULL,
            PRIMARY KEY (id, create_time)
        ) PARTITION BY RANGE (create_time)
    """)

    # Partitions: 2025-01 through 2026-12
    _create_partitions("deposit_withdrawal", "create_time", 2025, 1, 2026, 12)

    # Indexes on parent (propagated to all partitions)
    op.execute("CREATE UNIQUE INDEX idx_dw_serial_no ON deposit_withdrawal (serial_no, create_time)")
    op.execute("CREATE INDEX idx_dw_uid_create ON deposit_withdrawal (uid, create_time DESC)")
    op.execute("CREATE INDEX idx_dw_username_create ON deposit_withdrawal (username, create_time DESC)")
    op.execute("CREATE INDEX idx_dw_category_create ON deposit_withdrawal (category_id, create_time DESC)")
    op.execute("CREATE INDEX idx_dw_prostatus_create ON deposit_withdrawal (prostatus, create_time DESC)")
    op.execute("CREATE INDEX idx_dw_agent_create ON deposit_withdrawal (agent_id, create_time DESC)")
    # Partial indexes for hot paths
    op.execute(
        "CREATE INDEX idx_dw_withdrawal_only ON deposit_withdrawal (create_time DESC) "
        "WHERE category_id = 3"
    )
    op.execute(
        "CREATE INDEX idx_dw_pending ON deposit_withdrawal (create_time DESC) "
        "WHERE prostatus NOT IN (3, 4)"
    )

    # ===== bet_lottery (partitioned by create_time) =====
    op.execute("""
        CREATE TABLE bet_lottery (
            id                  BIGINT NOT NULL,
            create_time         TIMESTAMP NOT NULL,
            agent_id            SMALLINT NOT NULL DEFAULT 1,
            serial_no           VARCHAR(50) NOT NULL,
            uid                 INTEGER NOT NULL,
            user_parent         INTEGER,
            user_tree           JSONB,
            bet_data_set        JSONB,
            issue               VARCHAR(20) NOT NULL,
            issue_id            INTEGER NOT NULL,
            lottery_id          INTEGER NOT NULL,
            lottery_name        VARCHAR(100) NOT NULL,
            play_id             INTEGER NOT NULL,
            play_type_id        INTEGER NOT NULL,
            odds_id             INTEGER NOT NULL,
            odds                NUMERIC(7,4) NOT NULL,
            content             VARCHAR(500) NOT NULL,
            count               INTEGER NOT NULL,
            win_count           INTEGER NOT NULL DEFAULT 0,
            real_count          INTEGER NOT NULL DEFAULT 0,
            real_win_count      INTEGER NOT NULL DEFAULT 0,
            price               BIGINT NOT NULL,
            money               BIGINT NOT NULL,
            rebate              BIGINT NOT NULL DEFAULT 0,
            rebate_amount       BIGINT NOT NULL DEFAULT 0,
            result              BIGINT NOT NULL DEFAULT 0,
            prize               BIGINT NOT NULL DEFAULT 0,
            status              SMALLINT NOT NULL DEFAULT 0,
            commission_status   SMALLINT NOT NULL DEFAULT 0,
            source              SMALLINT NOT NULL DEFAULT 0,
            prize_time          TIMESTAMP,
            ip                  VARCHAR(45),
            is_tester           BOOLEAN NOT NULL DEFAULT FALSE,
            username            VARCHAR(50) NOT NULL,
            update_time         TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id, create_time)
        ) PARTITION BY RANGE (create_time)
    """)

    _create_partitions("bet_lottery", "create_time", 2025, 1, 2026, 12)

    op.execute("CREATE UNIQUE INDEX idx_bl_serial_no ON bet_lottery (serial_no, create_time)")
    op.execute("CREATE INDEX idx_bl_uid_create ON bet_lottery (uid, create_time DESC)")
    op.execute("CREATE INDEX idx_bl_username_create ON bet_lottery (username, create_time DESC)")
    op.execute("CREATE INDEX idx_bl_lottery_create ON bet_lottery (lottery_id, create_time DESC)")
    op.execute("CREATE INDEX idx_bl_status_create ON bet_lottery (status, create_time DESC)")
    op.execute("CREATE INDEX idx_bl_agent_create ON bet_lottery (agent_id, create_time DESC)")
    op.execute(
        "CREATE INDEX idx_bl_pending ON bet_lottery (create_time DESC) "
        "WHERE status = 0"
    )

    # ===== bet_order (partitioned by bet_time) — HIGHEST VOLUME =====
    op.execute("""
        CREATE TABLE bet_order (
            id                  BIGINT NOT NULL,
            bet_time            TIMESTAMP NOT NULL,
            agent_id            SMALLINT NOT NULL DEFAULT 1,
            serial_no           VARCHAR(50) NOT NULL,
            cid                 SMALLINT NOT NULL,
            platform_id         INTEGER NOT NULL,
            uid                 INTEGER NOT NULL,
            game_name           VARCHAR(255) NOT NULL,
            game_code           VARCHAR(50) NOT NULL,
            bet_amount          BIGINT NOT NULL DEFAULT 0,
            turnover            BIGINT NOT NULL DEFAULT 0,
            prize               BIGINT NOT NULL DEFAULT 0,
            win_lose            BIGINT NOT NULL DEFAULT 0,
            extra               VARCHAR(50),
            origin              VARCHAR(50),
            prizetime           TIMESTAMPTZ,
            platform_id_name    VARCHAR(50) NOT NULL,
            c_name              VARCHAR(100) NOT NULL,
            platform_username   VARCHAR(100) NOT NULL,
            delete_time         INTEGER NOT NULL DEFAULT 0,
            create_time         TIMESTAMP NOT NULL,
            update_time         TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id, bet_time)
        ) PARTITION BY RANGE (bet_time)
    """)

    _create_partitions("bet_order", "bet_time", 2025, 1, 2026, 12)

    op.execute("CREATE UNIQUE INDEX idx_bo_serial_no ON bet_order (serial_no, bet_time)")
    op.execute("CREATE INDEX idx_bo_uid_bettime ON bet_order (uid, bet_time DESC)")
    op.execute("CREATE INDEX idx_bo_platform_username_bettime ON bet_order (platform_username, bet_time DESC)")
    op.execute("CREATE INDEX idx_bo_platform_bettime ON bet_order (platform_id, bet_time DESC)")
    op.execute("CREATE INDEX idx_bo_agent_bettime ON bet_order (agent_id, bet_time DESC)")
    op.execute("CREATE INDEX idx_bo_cid_bettime ON bet_order (cid, bet_time DESC)")

    # ===== withdrawal_record VIEW =====
    op.execute("""
        CREATE VIEW withdrawal_record AS
        SELECT * FROM deposit_withdrawal WHERE category_id = 3
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS withdrawal_record")
    op.execute("DROP TABLE IF EXISTS bet_order CASCADE")
    op.execute("DROP TABLE IF EXISTS bet_lottery CASCADE")
    op.execute("DROP TABLE IF EXISTS deposit_withdrawal CASCADE")
