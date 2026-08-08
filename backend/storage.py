"""In-memory data store for delivery notes and the barcode/article lookup.

Everything that used to be module-level globals in app.py (deliveries_data,
current_data_file, barcode_article_map) now lives on a single DataStore
instance so the state and the logic that mutates it stay together.
"""

import json
import os
import threading

from config import (
    get_barcode_article_file_path,
    get_data_dir,
    most_recent_delivery_file,
)


class DataStore:
    def __init__(self):
        self.deliveries_data: dict | None = None
        self.current_data_file: str | None = None
        self.barcode_article_map: dict[str, str] = {}
        # Flask-SocketIO runs in threading mode, so multiple requests can
        # hit these read/write-to-disk methods concurrently. A single
        # reentrant lock keeps file writes from interleaving/corrupting
        # each other (methods below call each other while holding it).
        self.lock = threading.RLock()

    # ---------- barcode <-> article map ----------

    def load_or_create_barcode_map(self) -> dict[str, str]:
        """Load barcode-article.json, creating an empty one if missing."""
        with self.lock:
            barcode_file = get_barcode_article_file_path()
            try:
                if os.path.exists(barcode_file):
                    with open(barcode_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.barcode_article_map = {
                        a["artikelnr"]: a["strekkod"]
                        for a in data.get("articles", [])
                        if a.get("artikelnr") and a.get("strekkod")
                    }
                    print(f"Loaded barcode-article map from {barcode_file}")
                else:
                    self.barcode_article_map = {}
                    self.save_barcode_map()
                    print(f"Created new barcode-article.json at {barcode_file}")
            except Exception as e:
                print(f"Error loading barcode-article map: {e}")
                self.barcode_article_map = {}

            return self.barcode_article_map

    def save_barcode_map(self) -> bool:
        """Persist the current barcode map to disk."""
        with self.lock:
            barcode_file = get_barcode_article_file_path()
            try:
                articles_array = [
                    {"artikelnr": artikelnr, "strekkod": strekkod}
                    for artikelnr, strekkod in sorted(self.barcode_article_map.items())
                ]
                with open(barcode_file, "w", encoding="utf-8") as f:
                    json.dump({"articles": articles_array}, f, indent=2, ensure_ascii=False)
                print(f"Saved barcode-article map to {os.path.basename(barcode_file)}")
                return True
            except Exception as e:
                print(f"Error saving barcode-article map: {e}")
                return False

    def sync_barcode_map_from_deliveries(self) -> int:
        """Update the barcode map with any barcodes found in the current
        delivery data. Returns the number of new/changed entries."""
        with self.lock:
            if not self.deliveries_data:
                return 0

            updates_made = 0
            for delivery in self.deliveries_data.get("deliveries", []):
                for article in delivery.get("articles", []):
                    artikelnr = article.get("Artikelnr")
                    strekkod = article.get("Streckkod")
                    if artikelnr and strekkod:
                        if self.barcode_article_map.get(artikelnr) != strekkod:
                            self.barcode_article_map[artikelnr] = strekkod
                            updates_made += 1
                            print(f"Updated barcode for article {artikelnr}: {strekkod}")

            if updates_made > 0 or not os.path.exists(get_barcode_article_file_path()):
                self.save_barcode_map()

            return updates_made

    def fill_missing_barcodes(self) -> None:
        """Fill any empty Streckkod fields in deliveries_data from the map."""
        with self.lock:
            if not self.deliveries_data or not self.barcode_article_map:
                return

            for delivery in self.deliveries_data.get("deliveries", []):
                for article in delivery.get("articles", []):
                    artikelnr = article.get("Artikelnr")
                    if not article.get("Streckkod") and artikelnr in self.barcode_article_map:
                        article["Streckkod"] = self.barcode_article_map[artikelnr]
                        print(f"Filled barcode for article {artikelnr}: "
                              f"{self.barcode_article_map[artikelnr]}")

    # ---------- deliveries ----------

    def load_deliveries(self, file_path: str | None = None) -> bool:
        """Load delivery data into memory, from `file_path` or the newest file."""
        with self.lock:
            self.load_or_create_barcode_map()

            if file_path:
                if not os.path.exists(file_path):
                    print(f"Error: File not found at {file_path}")
                    return False
                self.current_data_file = file_path
            else:
                newest = most_recent_delivery_file()
                if not newest:
                    print("Error: No delivery files found")
                    return False
                self.current_data_file = newest

            try:
                with open(self.current_data_file, "r", encoding="utf-8") as f:
                    self.deliveries_data = json.load(f)
            except Exception as e:
                print(f"Error loading deliveries data: {e}")
                return False

            self.fill_missing_barcodes()
            print(f"Loaded deliveries data from {os.path.basename(self.current_data_file)}")
            return True

    def save_deliveries(self) -> bool:
        """Persist the in-memory delivery data back to its JSON file."""
        with self.lock:
            if not self.deliveries_data:
                print("Error saving: deliveries_data is empty")
                return False

            file_to_save = self.current_data_file
            if not file_to_save:
                newest = most_recent_delivery_file()
                if not newest:
                    print("Error saving: No delivery files found and no current_data_file set")
                    return False
                file_to_save = newest
                print(f"No current_data_file set, using most recent: {os.path.basename(file_to_save)}")

            try:
                print(f"Saving to: {file_to_save}")
                with open(file_to_save, "w", encoding="utf-8") as f:
                    json.dump(self.deliveries_data, f, indent=2, ensure_ascii=False)
                print(f"Saved deliveries data to {os.path.basename(file_to_save)}")
                return True
            except Exception as e:
                print(f"Error saving deliveries data: {e}")
                import traceback
                traceback.print_exc()
                return False

    def get_filename(self) -> str:
        """Basename of the current data file, resolving one if unset."""
        with self.lock:
            if not self.current_data_file:
                newest = most_recent_delivery_file()
                if newest:
                    self.current_data_file = newest
            return os.path.basename(self.current_data_file) if self.current_data_file else "No file loaded"

    def find_article(self, leveransnr: str, rad) -> dict | None:
        """Find an article by delivery number and row number (Rad)."""
        with self.lock:
            if not self.deliveries_data:
                return None

            rad = str(rad)
            for delivery in self.deliveries_data.get("deliveries", []):
                if delivery.get("leveransnr") == leveransnr:
                    for article in delivery.get("articles", []):
                        if article.get("Rad") == rad:
                            return article
            return None


# Single shared instance used across the app (routes import this directly).
store = DataStore()
