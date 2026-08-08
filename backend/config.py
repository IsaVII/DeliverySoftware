"""Application configuration and path helpers.

Centralizes all filesystem-path logic so the rest of the app never has to
know whether it's running from source or as a PyInstaller-frozen exe.
"""

import os
import sys

DELIVERY_FILE_PREFIX = "DELIVERY_NOTE_"
BARCODE_FILE_NAME = "barcode-article.json"
DEFAULT_PORT = 5000


def is_frozen() -> bool:
    """True when running as a PyInstaller-packaged executable."""
    return getattr(sys, "frozen", False)


def get_static_dir() -> str:
    """Return the folder that holds the built frontend (index.html, assets)."""
    if is_frozen():
        return os.path.join(sys._MEIPASS, "frontend", "dist")
    return os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


def get_data_dir() -> str:
    """Return the folder where delivery/barcode JSON files are stored.

    In a frozen build this lives next to the exe; in development it lives
    alongside the project source.
    """
    if is_frozen():
        exe_dir = os.path.dirname(sys.executable)
        data_dir = os.path.join(exe_dir, "data")
    else:
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

    os.makedirs(data_dir, exist_ok=True)
    return data_dir


def get_barcode_article_file_path() -> str:
    """Full path to the barcode <-> article-number lookup file."""
    return os.path.join(get_data_dir(), BARCODE_FILE_NAME)


def list_delivery_files() -> list[str]:
    """Full paths of every saved delivery-note JSON file, unsorted."""
    data_dir = get_data_dir()
    return [
        os.path.join(data_dir, f)
        for f in os.listdir(data_dir)
        if f.startswith(DELIVERY_FILE_PREFIX) and f.endswith(".json")
    ]


def most_recent_delivery_file() -> str | None:
    """Path of the most recently modified delivery-note file, or None."""
    files = list_delivery_files()
    return max(files, key=os.path.getmtime) if files else None
