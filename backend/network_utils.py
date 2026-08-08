"""Small helpers for local-network niceties (LAN IP, auto-opening a browser)."""

import socket
import webbrowser


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.settimeout(1)
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def open_browser(url: str = "http://127.0.0.1:5000") -> None:
    webbrowser.open(url)
