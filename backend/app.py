"""App factory and process entry point.

Run this file directly to start the server (as the original app.py did):
    python app.py
"""

import threading

from flask import Flask
from flask_cors import CORS

from config import DEFAULT_PORT, get_static_dir
from network_utils import get_local_ip, open_browser
from storage import store
from socketio_instance import socketio


def create_app() -> Flask:
    app = Flask(__name__, static_folder=get_static_dir(), static_url_path="")
    CORS(app)
    
    # Initialize SocketIO for real-time updates
    # Explicitly set async_mode='threading' for PyInstaller compatibility
    socketio.init_app(app, cors_allowed_origins="*", async_mode='threading')

    # Import blueprints after socketio is initialized
    from routes.barcode import barcode_bp
    from routes.deliveries import deliveries_bp
    from routes.misc import misc_bp
    from routes.pages import pages_bp
    from routes.upload import upload_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(misc_bp)
    app.register_blueprint(deliveries_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(barcode_bp)

    return app


def main():
    if not store.load_deliveries():
        print("Warning: Could not load deliveries data on startup")

    app = create_app()
    
    threading.Timer(1, open_browser, args=[f"http://127.0.0.1:{DEFAULT_PORT}"]).start()
    print(f"Also reachable on your network at: http://{get_local_ip()}:{DEFAULT_PORT}")

    # Use socketio.run() which handles both WebSocket and HTTP
    print(f"Starting Shop server on http://127.0.0.1:{DEFAULT_PORT}")
    socketio.run(app, host="0.0.0.0", port=DEFAULT_PORT, debug=False)


if __name__ == "__main__":
    main()
