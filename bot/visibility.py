import json
from pathlib import Path

VISIBILITY_FILE = Path(__file__).parent.parent / "data" / "visibility.json"


def load_visibility() -> dict[str, bool]:
    if VISIBILITY_FILE.exists():
        with open(VISIBILITY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_visibility(data: dict[str, bool]) -> None:
    VISIBILITY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(VISIBILITY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def toggle_visibility(miss_id: str) -> bool:
    data = load_visibility()
    current = data.get(miss_id, True)
    data[miss_id] = not current
    save_visibility(data)
    return data[miss_id]
