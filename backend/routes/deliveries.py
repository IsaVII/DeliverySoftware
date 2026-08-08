"""Read and write endpoints for the currently loaded delivery data."""

import traceback

from flask import Blueprint, jsonify, request

from storage import store
from socketio_instance import socketio

deliveries_bp = Blueprint("deliveries", __name__, url_prefix="/api/deliveries")


def _emit_update(update_data: dict) -> None:
    """Emit a delivery_updated event, logging (but not raising) on failure."""
    try:
        socketio.emit("delivery_updated", update_data)
    except Exception:
        traceback.print_exc()


def _get_json_body() -> dict:
    """Return the request's JSON body as a dict, or {} if missing/invalid.

    Using silent=True means a missing/invalid body results in a normal
    validation error (400) below instead of an uncaught exception (500).
    """
    return request.get_json(silent=True) or {}


def _get_deliverynr_and_rad(data: dict):
    """Extract and validate (deliverynr, rad) from a request body.

    Returns (deliverynr, rad, error_response). error_response is None if
    validation passed.
    """
    deliverynr = data.get("deliverynr")
    rad = data.get("rad")

    if rad is not None:
        rad = str(rad)

    if not deliverynr or not rad:
        return None, None, (jsonify({
            "error": f"Missing deliverynr or rad. Got deliverynr={deliverynr}, rad={rad}"
        }), 400)

    return deliverynr, rad, None


@deliveries_bp.route("")
def get_deliveries():
    """Return the full delivery data currently held in memory."""
    if not store.deliveries_data:
        return jsonify({"error": "Delivery data not loaded"}), 500
    return jsonify(store.deliveries_data)


@deliveries_bp.route("/filename")
def get_deliveries_filename():
    """Return the filename of the currently loaded delivery data."""
    try:
        return jsonify({"filename": store.get_filename()})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "filename": "Error reading filename"}), 500


@deliveries_bp.route("/metadata")
def get_deliveries_metadata():
    """Return the metadata block (e.g. Leveransdatum) for the current data."""
    if not store.deliveries_data:
        return jsonify({"error": "Delivery data not loaded"}), 500

    metadata = store.deliveries_data.get("metadata")
    return jsonify(metadata if isinstance(metadata, dict) else {})


@deliveries_bp.route("/barcode", methods=["POST"])
def save_barcode():
    """Save the barcode (Streckkod) for a specific delivery/row."""
    try:
        data = _get_json_body()
        deliverynr, rad, error = _get_deliverynr_and_rad(data)
        if error:
            return error
        barcode = data.get("barcode")

        with store.lock:
            article = store.find_article(deliverynr, rad)
            if not article:
                return jsonify({"error": f"Article with Rad {rad} not found in delivery {deliverynr}"}), 404

            article["Streckkod"] = barcode

            artikelnr = article.get("Artikelnr")
            if barcode:
                store.barcode_article_map[artikelnr] = barcode
            else:
                store.barcode_article_map.pop(artikelnr, None)

            delivery_saved = store.save_deliveries()
            map_saved = store.save_barcode_map()

        if delivery_saved and map_saved:
            _emit_update({
                "type": "barcode",
                "deliverynr": deliverynr,
                "Rad": rad,
                "streckkod": barcode,
                "article": article,
            })
            return jsonify({"success": True, "message": f"Barcode saved for Rad {rad}"}), 200

        return jsonify({"error": "Failed to save barcode to file"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@deliveries_bp.route("/received", methods=["POST"])
def save_received():
    """Save the received quantity for a specific delivery/row."""
    try:
        data = _get_json_body()
        deliverynr, rad, error = _get_deliverynr_and_rad(data)
        if error:
            return error
        received = data.get("received")

        if received is None:
            return jsonify({"error": "Missing received quantity"}), 400

        with store.lock:
            article = store.find_article(deliverynr, rad)
            if not article:
                return jsonify({"error": f"Article with Rad {rad} not found in delivery {deliverynr}"}), 404

            try:
                article["received"] = float(received) if received != -1 else -1
            except (TypeError, ValueError):
                return jsonify({"error": f"Invalid received quantity: {received!r}"}), 400

            saved = store.save_deliveries()

        if saved:
            _emit_update({
                "type": "received",
                "deliverynr": deliverynr,
                "Rad": rad,
                "received": article["received"],
                "article": article,
            })
            return jsonify({"success": True, "message": f"Received quantity saved for Rad {rad}"}), 200

        return jsonify({"error": "Failed to save received quantity to file"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@deliveries_bp.route("/comment", methods=["POST"])
def save_comment():
    """Save the comment for a specific delivery/row."""
    try:
        data = _get_json_body()
        deliverynr, rad, error = _get_deliverynr_and_rad(data)
        if error:
            return error
        comment = data.get("comment")

        if comment is None:
            return jsonify({"error": "Missing comment"}), 400

        with store.lock:
            article = store.find_article(deliverynr, rad)
            if not article:
                return jsonify({"error": f"Article with Rad {rad} not found in delivery {deliverynr}"}), 404

            article["comment"] = str(comment)

            saved = store.save_deliveries()

        if saved:
            _emit_update({
                "type": "comment",
                "deliverynr": deliverynr,
                "Rad": rad,
                "comment": article["comment"],
                "article": article,
            })
            return jsonify({"success": True, "message": f"Comment saved for Rad {rad}"}), 200

        return jsonify({"error": "Failed to save comment to file"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
