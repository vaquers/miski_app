import json
from pathlib import Path

STATUS_FILE = Path(__file__).parent.parent / "data" / "voting_status.json"

DEFAULT_STATUS = {"defile": False, "photos": False}


def load_status() -> dict:
    if STATUS_FILE.exists():
        with open(STATUS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return dict(DEFAULT_STATUS)


def save_status(data: dict) -> None:
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def set_voting(nomination: str, is_open: bool) -> dict:
    data = load_status()
    if nomination in ("defile", "photos"):
        data[nomination] = is_open
    save_status(data)
    return data
