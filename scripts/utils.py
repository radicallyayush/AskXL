from __future__ import annotations

import csv
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from statistics import mean, median
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT / "input"
DATA_DIR = ROOT / "data"


def discover_csv_files() -> list[Path]:
    return sorted(path for path in INPUT_DIR.rglob("*.csv") if path.is_file())


def discover_markdown_files() -> list[Path]:
    sample_dir = INPUT_DIR / "sample_projects"
    if not sample_dir.exists():
        return []
    return sorted(path for path in sample_dir.rglob("*.md") if path.is_file())


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in {"", "na", "n/a", "null", "none", "-"} else text


def to_float(value: Any, default: float = 0.0) -> float:
    text = clean_text(value)
    if not text:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def to_int(value: Any, default: int = 0) -> int:
    text = clean_text(value)
    if not text:
        return default
    try:
        return int(float(text))
    except ValueError:
        return default


def slugify(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def normalize_name(value: str) -> str:
    text = clean_text(value)
    return re.sub(r"\s+", " ", text).strip()


def safe_mean(values: Iterable[float]) -> float:
    values = list(values)
    return round(mean(values), 2) if values else 0.0


def safe_median(values: Iterable[float]) -> float:
    values = list(values)
    return round(median(values), 2) if values else 0.0


def distribution_buckets(values: Iterable[float]) -> dict[str, int]:
    buckets = {
        "0-4": 0,
        "4-6": 0,
        "6-7": 0,
        "7-8": 0,
        "8-9": 0,
        "9-10": 0
    }
    for value in values:
      # keep the bucket logic inclusive and readable for dashboard reporting
        if value < 4:
            buckets["0-4"] += 1
        elif value < 6:
            buckets["4-6"] += 1
        elif value < 7:
            buckets["6-7"] += 1
        elif value < 8:
            buckets["7-8"] += 1
        elif value < 9:
            buckets["8-9"] += 1
        else:
            buckets["9-10"] += 1
    return buckets


def top_n(counter: Counter, limit: int = 10) -> list[dict[str, Any]]:
    return [
        {"label": key, "count": value}
        for key, value in counter.most_common(limit)
    ]
