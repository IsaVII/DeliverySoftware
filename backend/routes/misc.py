"""Small demo/utility endpoints, unrelated to delivery data."""

from flask import Blueprint, jsonify

from network_utils import get_local_ip

misc_bp = Blueprint("misc", __name__)


@misc_bp.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Python!"})


@misc_bp.route("/api/article")
def get_article():
    return jsonify({
        "name": "mau",
        "body": "This is the article content, sent from Flask.",
    })


@misc_bp.route("/api/local-ip")
def get_ip():
    return jsonify({"local_ip": get_local_ip()})
