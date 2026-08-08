"""Small file I/O helpers for the pdf_extraction package."""

import json


def save_json(data: dict, output_path) -> None:
    """Save extracted data to a JSON file with pretty formatting."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
