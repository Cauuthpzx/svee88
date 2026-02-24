.PHONY: dev worker lint format typecheck migrate upgrade downgrade superuser tier up down logs build test setup-local setup-staging setup-production

# ── Development (không Docker) ──────────────────────────────
dev:
	cd src && uvicorn hubserver.main:app --reload --host 0.0.0.0 --port 8000

worker:
	cd src && arq hubserver.core.worker.settings.WorkerSettings

# ── Code quality ────────────────────────────────────────────
lint:
	ruff check src/ && ruff format --check src/

format:
	ruff format src/ && ruff check --fix src/

typecheck:
	mypy src/

# ── Database ────────────────────────────────────────────────
migrate:
	cd src && alembic revision --autogenerate -m "$(m)"

upgrade:
	cd src && alembic upgrade head

downgrade:
	cd src && alembic downgrade -1

# ── Scripts ─────────────────────────────────────────────────
superuser:
	cd src && python -m hubserver.scripts.create_first_superuser

tier:
	cd src && python -m hubserver.scripts.create_first_tier

# ── Docker ──────────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f web

build:
	docker compose build

# ── Test ────────────────────────────────────────────────────
test:
	pytest tests/

# ── Setup ───────────────────────────────────────────────────
setup-local:
	python setup.py local

setup-staging:
	python setup.py staging

setup-production:
	python setup.py production
