"""Endpoint that syncs the barcode/article lookup with the loaded deliveries."""

from flask import Blueprint, jsonify

from storage import store

barcode_bp = Blueprint("barcode", __name__)


@barcode_bp.route("/api/barcodeupdate", methods=["POST"])
def update_barcode_data():
    """Merge any barcodes present in the current delivery data into the
    persistent barcode-article map. Existing entries not present in the
    current deliveries are preserved."""
    try:
        with store.lock:
            if not store.deliveries_data:
                return jsonify({"error": "Delivery data not loaded"}), 500

            updates_made = store.sync_barcode_map_from_deliveries()

        return jsonify({
            "success": True,
            "message": f"Barcode map updated with {updates_made} new/changed entries",
            "total_articles": len(store.barcode_article_map),
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
