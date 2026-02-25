# Production Cleanup & Deploy Preparation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dọn dẹp repo, sắp xếp cấu trúc thư mục chuẩn, chuẩn bị deploy production lên VPS Linux (Nginx + Uvicorn).

**Architecture:** Monorepo với BACKEND/ (FastAPI) + FRONTEND/ (Vite SPA). Frontend build thành static files serve qua FastAPI hoặc Nginx. Backend chạy Uvicorn behind Nginx reverse proxy.

**Tech Stack:** Python/FastAPI/Uvicorn (backend), Vite/Layui/Vanilla JS (frontend), Nginx (reverse proxy)

---

### Task 1: Đổi tên FRONEND → FRONTEND

**Files:**
- Rename: `FRONEND/` → `FRONTEND/`
- Modify: `run.bat` (2 chỗ tham chiếu)
- Modify: `FRONTEND/CLAUDE.md` (3 chỗ tham chiếu)
- Modify: `BACKEND/.agents/skills/svg-icon-designer/SKILL.md` (4 chỗ)
- Modify: `docs/plans/2026-02-25-i18n-design.md` (2 chỗ)

**Step 1: Rename thư mục**
```bash
git mv FRONEND FRONTEND
```

**Step 2: Cập nhật run.bat**
Thay `FRONEND` → `FRONTEND` (2 dòng: line 16, 29)

**Step 3: Cập nhật FRONTEND/CLAUDE.md**
Thay `FRONEND` → `FRONTEND` (3 chỗ: line 18, 191, 192)

**Step 4: Cập nhật BACKEND skill và docs**
Thay `FRONEND` → `FRONTEND` trong svg-icon-designer/SKILL.md và i18n-design.md

**Step 5: Commit**
```bash
git add -A && git commit -m "refactor: rename FRONEND → FRONTEND (fix typo)"
```

---

### Task 2: Gom scripts + data vào scripts/

**Files:**
- Move: `fetch_all_payloads.py`, `fetch_complete.py`, `fetch_missing.py`, `fix_vn_ime.py` → `scripts/`
- Move: `download-business-icons.mjs`, `download-icons.mjs` → `scripts/`
- Move: `all_payloads.json`, `all_payloads_extra.json`, `complete_payloads.json`, `final_payload_samples.json`, `fixed_payloads.json`, `missing_payloads.json` → `scripts/data/`
- Delete: `HÂU DAI.xlsx`

**Step 1: Tạo thư mục và di chuyển**
```bash
mkdir -p scripts/data
git mv fetch_*.py fix_vn_ime.py scripts/
git mv download-*.mjs scripts/
git mv *.json scripts/data/  # (trừ package.json nếu có)
git rm "HÂU DAI.xlsx"
```

**Step 2: Commit**
```bash
git commit -m "refactor: gom scripts/data vào scripts/, xóa file thừa"
```

---

### Task 3: Gom docs vào docs/

**Files:**
- Move: `CODING_STANDARDS.md`, `LAYUI_SPA_STANDARDS.md`, `TIEUCHUANSPA.md` → `docs/`

**Step 1: Di chuyển**
```bash
git mv CODING_STANDARDS.md LAYUI_SPA_STANDARDS.md TIEUCHUANSPA.md docs/
```

**Step 2: Cập nhật tham chiếu trong FRONTEND/CLAUDE.md**
Line 5: `CODING_STANDARDS.md (root project)` → `docs/CODING_STANDARDS.md`

**Step 3: Commit**
```bash
git commit -m "refactor: gom tài liệu chuẩn vào docs/"
```

---

### Task 4: Xóa file rác, clean cache

**Files:**
- Delete: `src/app/logs/app.log` (tracked trong git)
- Delete: `src/` directory ở root (chỉ chứa log)
- Clean: tất cả `__pycache__/`

**Step 1: Xóa tracked log + src**
```bash
git rm -r src/
```

**Step 2: Clean __pycache__**
```bash
find BACKEND/ -type d -name __pycache__ -exec rm -rf {} +
```

**Step 3: Commit**
```bash
git commit -m "chore: xóa log tracked, clean __pycache__"
```

---

### Task 5: Cập nhật .gitignore toàn diện

**Files:**
- Modify: `.gitignore` (root)
- Modify: `FRONTEND/.gitignore`

**Step 1: Cập nhật root .gitignore**
Thêm: `src/`, `*.xlsx`, `scripts/data/` (optional), đảm bảo cover `__pycache__/`, `*.log`, `node_modules/`, `.env`

**Step 2: Verify FRONTEND/.gitignore**
Đảm bảo có: `node_modules/`, `build/`, `dist/`, `.env`, `.env.*`, `!.env.example`

**Step 3: Commit**
```bash
git commit -m "chore: cập nhật .gitignore cho production"
```

---

### Task 6: Tạo .env.example cho deploy

**Files:**
- Create: `FRONTEND/.env.example`
- Create: `BACKEND/src/.env.example`

**Step 1: Tạo frontend .env.example**
```
VITE_API_BASE=http://localhost:8000
```

**Step 2: Tạo backend .env.example** (nếu chưa có)
Copy từ scripts/local_with_uvicorn/.env.example

**Step 3: Commit**
```bash
git commit -m "chore: thêm .env.example hướng dẫn deploy"
```

---

### Task 7: Build frontend production

**Step 1: Install dependencies**
```bash
cd FRONTEND && npm ci
```

**Step 2: Build production**
```bash
npm run build
```

**Step 3: Verify build output**
Kiểm tra `FRONTEND/build/` có index.html, js/, css/

**Step 4: Test preview**
```bash
npm run preview
```

---

### Task 8: Verify cấu trúc cuối cùng

Cấu trúc mong đợi:
```
SERVER ONLINE/
├── BACKEND/
├── FRONTEND/
│   ├── build/          # Production build output
│   ├── app/            # Source code
│   ├── public/         # Static assets
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── data/           # JSON payloads
│   ├── *.py            # Python utility scripts
│   └── *.mjs           # JS utility scripts
├── docs/
│   ├── plans/
│   ├── CODING_STANDARDS.md
│   ├── LAYUI_SPA_STANDARDS.md
│   └── TIEUCHUANSPA.md
├── .gitignore
└── run.bat
```
