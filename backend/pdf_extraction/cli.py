"""Command-line entry point: extract DELIVERY_NOTE.PDF (or a given file) to JSON.

Usage:
    python -m pdf_extraction.cli
"""

import json
import os
from pathlib import Path

from .extractor import extract_delivery_data
from .io_utils import save_json


def handle_pdf_extraction(pdf_input=None) -> dict | None:
    """
    Run PDF extraction and, in command-line mode, write the result to disk.

    Args:
        pdf_input: Optional path or bytes. If None, reads DELIVERY_NOTE.PDF
            from this package's directory and writes output.json under
            ./data in the current working directory.

    Returns:
        The extracted data dict, or None if no input PDF was found.
    """
    output_path = None

    if pdf_input is None:
        pdf_path = Path(__file__).parent / "DELIVERY_NOTE.PDF"
        if not pdf_path.exists():
            print(f"Error: PDF file not found at {pdf_path}")
            return None

        print(f"Reading PDF from: {pdf_path}")
        pdf_input = str(pdf_path)

        data_folder = Path(os.getcwd()) / "data"
        data_folder.mkdir(parents=True, exist_ok=True)
        output_path = data_folder / "output.json"

    data = extract_delivery_data(pdf_input)

    if output_path:
        save_json(data, str(output_path))

        print("✓ Extraction complete!")
        print(f"✓ Found {len(data['deliveries'])} delivery(ies)")

        total_articles = sum(len(d.get("articles", [])) for d in data["deliveries"])
        print(f"✓ Found {total_articles} article(s)")
        
        not_delivered_count = len(data.get("not_delivered", []))
        if not_delivered_count > 0:
            print(f"✓ Found {not_delivered_count} not-delivered item(s)")
        
        print(f"✓ JSON saved to: {output_path}")

        print("\nSample of extracted data:")
        sample = data["deliveries"][0] if data["deliveries"] else {}
        print(json.dumps(sample, indent=2, ensure_ascii=False))

    return data


if __name__ == "__main__":
    handle_pdf_extraction()
