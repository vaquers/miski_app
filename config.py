from dotenv import load_dotenv
import os
import subprocess

load_dotenv()


def _get_app_version() -> str:
    """Auto-detect version from git SHA so every deploy busts Telegram cache."""
    sha = os.getenv("RAILWAY_GIT_COMMIT_SHA", "")
    if sha:
        return sha[:7]
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return "unknown"


APP_VERSION = _get_app_version()

TG_TOKEN = os.getenv("TG_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "5584466914"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://miski-rho.vercel.app")
API_PORT = int(os.getenv("PORT", os.getenv("API_PORT", "8080")))


def get_webapp_url() -> str:
    """WEBAPP_URL with cache-busting version param for Telegram WebView."""
    sep = "&" if "?" in WEBAPP_URL else "?"
    return f"{WEBAPP_URL}{sep}v={APP_VERSION}"


MISSES = [
    {"id": "alina", "name": "Алина Василевская"},
    {"id": "nastya", "name": "Настя Коновалова"},
    {"id": "ksyusha", "name": "Ксюша Антонова"},
    {"id": "emiliya", "name": "Эмилия Сидоренко"},
    {"id": "angelina", "name": "Ангелина Самокиш"},
    {"id": "adelya", "name": "Адель Шаповалова"},
    {"id": "polina", "name": "Полина Искорцева"},
    {"id": "sonya", "name": "Соня Ляшевич"},
]
