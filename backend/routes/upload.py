"""Handles uploading a delivery note as either a PDF or a JSON file."""

import json
import os
from datetime import datetime
from pathlib import Path

from flask import Blueprint, jsonify, request

from config import DELIVERY_FILE_PREFIX, get_data_dir
from pdf_extraction import extract_delivery_data
from storage import store

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {".pdf", ".json"}


def _parse_uploaded_file(file_ext: str, file_content: bytes):
    """Return (delivery_data, error_response) for a PDF or JSON upload."""
    if file_ext == ".pdf":
        try:
            return extract_delivery_data(file_content), None
        except Exception as e:
            return None, (jsonify({"error": f"Failed to extract PDF: {str(e)}"}), 400)

    try:
        return json.loads(file_content), None
    except json.JSONDecodeError as e:
        return None, (jsonify({"error": f"Invalid JSON file: {str(e)}"}), 400)


@upload_bp.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Only PDF and JSON files are supported"}), 400

    try:
        delivery_data, error = _parse_uploaded_file(file_ext, file.read())
        if error:
            return error

        if not isinstance(delivery_data, dict) or "deliveries" not in delivery_data:
            return jsonify({"error": 'Invalid file structure. Expected {"deliveries": [...]}'}), 400

        with store.lock:
            # Only save to disk if it's a PDF upload
            if file_ext == ".pdf":
                timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                output_filename = f"{DELIVERY_FILE_PREFIX}{timestamp}.json"
                output_path = os.path.join(get_data_dir(), output_filename)

                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(delivery_data, f, indent=2, ensure_ascii=False)

                store.current_data_file = output_path
            else:
                # For JSON uploads, use the original filename
                output_filename = file.filename

            store.deliveries_data = delivery_data
            store.fill_missing_barcodes()
            store.save_barcode_map()

        return jsonify({
            "success": True,
            "message": "File uploaded and processed successfully",
            "filename": output_filename,
            "deliveries_count": len(delivery_data.get("deliveries", [])),
            "total_articles": sum(len(d.get("articles", [])) for d in delivery_data.get("deliveries", [])),
        }), 200

    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500
