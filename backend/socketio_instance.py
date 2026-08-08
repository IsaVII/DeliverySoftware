"""Separate module for SocketIO instance to avoid circular imports."""

from flask_socketio import SocketIO

# Use threading mode and manage_middleware=False for PyInstaller compatibility
# Threading mode is the most reliable async_mode for frozen executables
# as it doesn't require eventlet or gevent which can fail in PyInstaller
socketio = SocketIO(async_mode='threading', manage_middleware=False)
