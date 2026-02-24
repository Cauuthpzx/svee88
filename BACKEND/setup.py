#!/usr/bin/env python3
"""
HubServer Setup Script

Tu dong sao chep file cau hinh cho cac moi truong trien khai khac nhau.
"""

import shutil
import sys
from pathlib import Path

DEPLOYMENTS = {
    "local": {
        "name": "Phat trien cuc bo (Uvicorn)",
        "description": "Tu dong reload, phu hop cho lap trinh vien",
        "path": "scripts/local_with_uvicorn",
    },
    "staging": {
        "name": "Staging (Gunicorn + Uvicorn Workers)",
        "description": "Moi truong kiem thu giong production",
        "path": "scripts/gunicorn_managing_uvicorn_workers",
    },
    "production": {
        "name": "Production (NGINX + Gunicorn)",
        "description": "Trien khai chinh thuc voi reverse proxy",
        "path": "scripts/production_with_nginx",
    },
}


def show_help():
    """Hien thi huong dan su dung"""
    print()
    print("  +======================================+")
    print("  |        HubServer -- Thiet lap         |")
    print("  +======================================+")
    print()
    print("  Cach dung: python setup.py <kieu-trien-khai>")
    print()
    print("  Cac kieu trien khai:")
    for key, config in DEPLOYMENTS.items():
        print(f"    {key:12} -- {config['name']}")
        print(f"    {' ' * 12}    {config['description']}")
        print()
    print("  Vi du:")
    print("    python setup.py local       # Thiet lap cho phat trien cuc bo")
    print("    python setup.py staging     # Thiet lap cho moi truong staging")
    print("    python setup.py production  # Thiet lap cho trien khai chinh thuc")
    print()


def copy_files(deployment_type: str):
    """Sao chep file cau hinh cho kieu trien khai da chon"""
    if deployment_type not in DEPLOYMENTS:
        print(f"  [X] Kieu trien khai khong hop le: {deployment_type}")
        print()
        show_help()
        return False

    config = DEPLOYMENTS[deployment_type]
    source_path = Path(config["path"])

    if not source_path.exists():
        print(f"  [X] Khong tim thay thu muc cau hinh: {source_path}")
        return False

    print()
    print(f"  >>> Dang thiet lap: {config['name']}...")
    print(f"      {config['description']}")
    print()

    files_to_copy = [
        ("Dockerfile", "Dockerfile"),
        ("docker-compose.yml", "docker-compose.yml"),
        (".env.example", "src/.env"),
    ]

    success = True
    for source_file, dest_file in files_to_copy:
        source = source_path / source_file
        dest = Path(dest_file)

        if not source.exists():
            print(f"  [!] Canh bao: Khong tim thay {source}, bo qua...")
            continue

        try:
            dest.parent.mkdir(parents=True, exist_ok=True)

            shutil.copy2(source, dest)
            print(f"  [+] Da sao chep  {source}  -->  {dest}")

        except Exception as e:
            print(f"  [X] Loi sao chep {source} --> {dest}: {e}")
            success = False

    if success:
        print()
        print("  ======================================")
        print("   Thiet lap hoan tat!")
        print("  ======================================")
        print()

        if deployment_type in ["staging", "production"]:
            print("  [!] QUAN TRONG: Cap nhat file .env voi gia tri thuc te:")
            print("      - Tao SECRET_KEY moi:  openssl rand -hex 32")
            print("      - Doi tat ca mat khau va gia tri nhay cam")
            print()

        print("  Buoc tiep theo:")
        print("      docker compose up")

        if deployment_type == "local":
            print("      Mo  http://127.0.0.1:8000/docs")
        elif deployment_type == "production":
            print("      Mo  http://localhost")

        print()
        return True

    return False


def interactive_setup():
    """Thiet lap tuong tac khi khong co tham so"""
    print()
    print("  +======================================+")
    print("  |        HubServer -- Thiet lap         |")
    print("  +======================================+")
    print()
    print("  Chon kieu trien khai:")
    print()

    options = list(DEPLOYMENTS.keys())
    for i, key in enumerate(options, 1):
        config = DEPLOYMENTS[key]
        print(f"    {i}. {config['name']}")
        print(f"       {config['description']}")
        print()

    while True:
        try:
            choice = input(f"  Lua chon cua ban (1-{len(options)}): ").strip()

            if choice.isdigit():
                choice_num = int(choice)
                if 1 <= choice_num <= len(options):
                    return options[choice_num - 1]

            if choice.lower() in DEPLOYMENTS:
                return choice.lower()

            print(f"  [X] Khong hop le. Vui long nhap 1-{len(options)} hoac ten kieu trien khai.")

        except KeyboardInterrupt:
            print("\n\n  Da huy thiet lap.")
            return None
        except EOFError:
            print("\n\n  Da huy thiet lap.")
            return None


def main():
    """Diem khoi chay chinh"""
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help", "help"]:
        show_help()
        return

    if len(sys.argv) == 2:
        deployment_type = sys.argv[1].lower()
    elif len(sys.argv) == 1:
        deployment_type = interactive_setup()
        if deployment_type is None:
            return
    else:
        show_help()
        return

    success = copy_files(deployment_type)

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
