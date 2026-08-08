"""Top-level orchestration: PDF (path or bytes) -> structured dict."""

import io
from pathlib import Path

import pdfplumber

from .article_parser import parse_delivery_data
from .metadata_parser import extract_metadata


def _read_pdf_text(pdf_input) -> str:
    """Extract and concatenate text from every page of the PDF."""
    if isinstance(pdf_input, (str, Path)):
        source = pdf_input
    elif isinstance(pdf_input, bytes):
        source = io.BytesIO(pdf_input)
    else:
        source = pdf_input  # already a file-like object (e.g. BytesIO)

    with pdfplumber.open(source) as pdf:
        pages_text = (page.extract_text() for page in pdf.pages)
        return "\n".join(text for text in pages_text if text) + "\n"


def extract_delivery_data(pdf_input) -> dict:
    """
    Extract delivery and article data from a PDF and return it as a dict.

    Args:
        pdf_input: A file path (str/Path), raw PDF bytes, or a file-like
            object (e.g. BytesIO).

    Returns:
        {"metadata": {...}, "deliveries": [...], "not_delivered": [...]}  (metadata omitted if none found)
    """
    text = _read_pdf_text(pdf_input)

    metadata = extract_metadata(text)
    parsed_data = parse_delivery_data(text)
    deliveries = parsed_data.get("deliveries", [])
    not_delivered = parsed_data.get("not_delivered", [])

    result: dict = {}
    if metadata:
        result["metadata"] = metadata
    result["deliveries"] = deliveries
    if not_delivered:
        result["not_delivered"] = not_delivered
    return result


def extract_from_uploaded_pdf(pdf_bytes: bytes) -> dict:
    """Convenience wrapper for uploaded PDF bytes (Flask request.files, etc.)."""
    return extract_delivery_data(pdf_bytes)
