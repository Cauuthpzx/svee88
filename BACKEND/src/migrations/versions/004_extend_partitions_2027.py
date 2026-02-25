"""Extend partitions through 2027 for partitioned tables.

Revision ID: 004_partitions_2027
Revises: 003_agents
Create Date: 2026-02-25
"""

from alembic import op

revision = "004_partitions_2027"
down_revision = "003_agents"
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


def _create_partitions(table: str, year_start: int, month_start: int, year_end: int, month_end: int):
    """Create monthly partitions for a partitioned table."""
    for y, m in _month_range(year_start, month_start, year_end, month_end):
        ny, nm = (y, m + 1) if m < 12 else (y + 1, 1)
        part_name = f"{table}_{y}_{m:02d}"
        op.execute(
            f"CREATE TABLE IF NOT EXISTS {part_name} PARTITION OF {table} "
            f"FOR VALUES FROM ('{y}-{m:02d}-01') TO ('{ny}-{nm:02d}-01')"
        )


def upgrade() -> None:
    # Extend all partitioned tables through 2027-12
    _create_partitions("deposit_withdrawal", 2027, 1, 2027, 12)
    _create_partitions("bet_lottery", 2027, 1, 2027, 12)
    _create_partitions("bet_order", 2027, 1, 2027, 12)


def downgrade() -> None:
    for table in ("bet_order", "bet_lottery", "deposit_withdrawal"):
        for m in range(12, 0, -1):
            op.execute(f"DROP TABLE IF EXISTS {table}_2027_{m:02d}")
