"""Serves the built frontend's index.html."""

from flask import Blueprint, current_app, send_from_directory

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    return send_from_directory(current_app.static_folder, "index.html")
