"""Upstream proxy router — forward requests to agents in parallel."""

from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio.session import AsyncSession

from ....core.db.database import async_get_db
from ....core.deps import get_current_user
from .proxy import fetch_rebate_games, fetch_rebate_init, fetch_rebate_panel
from .swr import get_cache_stats, swr_fetch

# Maximum rows fetched for computing report totals (prevents OOM)
_TOTALS_MAX_ROWS = 5000

router = APIRouter(
    prefix="/proxy",
    tags=["proxy"],
    dependencies=[Depends(get_current_user)],
)


def _parse_form(body: bytes) -> dict[str, str]:
    """Decode URL-encoded form body into a flat dict."""
    parsed = parse_qs(body.decode("utf-8"))
    return {k: v[0] for k, v in parsed.items()}


def _extract_agent_id(params: dict) -> int | None:
    raw = params.pop("agent_id", None)
    return int(raw) if raw and raw != "0" else None


# ── Rebate-specific routes (must be before the catch-all) ──


@router.post("/rebate-init")
async def proxy_rebate_init(
    request: Request,
    db: AsyncSession = Depends(async_get_db),
) -> dict:
    """Get lottery series + first series' games for rebate page dropdowns."""
    params = _parse_form(await request.body())
    return await fetch_rebate_init(db, _extract_agent_id(params))


@router.post("/rebate-games")
async def proxy_rebate_games(
    request: Request,
    db: AsyncSession = Depends(async_get_db),
) -> dict:
    """Get lottery games for a specific series."""
    params = _parse_form(await request.body())
    series_id = params.get("series_id", "")
    return await fetch_rebate_games(db, series_id, _extract_agent_id(params))


@router.post("/rebate")
async def proxy_rebate(
    request: Request,
    db: AsyncSession = Depends(async_get_db),
) -> dict:
    """Get rebate odds panel for a specific lottery game."""
    params = _parse_form(await request.body())
    lottery_id = params.get("lottery_id", "")
    series_id = params.get("series_id", "")
    return await fetch_rebate_panel(db, lottery_id, series_id, _extract_agent_id(params))


# ── Generic catch-all proxy ──


@router.get("/cache-stats")
async def cache_stats() -> dict:
    """SWR cache statistics."""
    return get_cache_stats()


@router.post("/{endpoint}")
async def proxy_upstream(
    endpoint: str,
    request: Request,
    db: AsyncSession = Depends(async_get_db),
) -> dict:
    """Proxy request with 3-layer SWR cache (Memory → Redis → Upstream).

    Query params:
      _fresh=1  → bypass cache, always fetch from upstream
    """
    params = _parse_form(await request.body())
    agent_id = _extract_agent_id(params)
    force_fresh = request.query_params.get("_fresh") == "1"
    result = await swr_fetch(db, endpoint, params, agent_id, force_fresh)

    # Report endpoints: compute column totals
    if endpoint.startswith("report-") and result.get("code") == 0:
        totals_params = {k: v for k, v in params.items() if k not in ("page", "limit")}
        totals_params["page"] = "1"
        totals_params["limit"] = str(_TOTALS_MAX_ROWS)
        totals_res = await swr_fetch(
            db, endpoint, totals_params, agent_id, force_fresh=False,
        )
        if totals_res.get("code") == 0 and totals_res.get("data"):
            _totals: dict[str, float] = {}
            _uniques: dict[str, set] = {}
            for row in totals_res["data"]:
                for key, val in row.items():
                    if key.startswith("_"):
                        continue
                    try:
                        _totals[key] = _totals.get(key, 0) + float(val)
                    except (ValueError, TypeError):
                        if key not in _uniques:
                            _uniques[key] = set()
                        if val:
                            _uniques[key].add(str(val))
            for key, vals in _uniques.items():
                _totals[key] = len(vals)
            result["_totals"] = _totals
            if len(totals_res["data"]) >= _TOTALS_MAX_ROWS:
                result["_totals_truncated"] = True

    return result
