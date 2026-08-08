"""Extracts the header metadata block from a delivery-note PDF's text.

Looks for: Foljesedelnr/Transportnr, Leveransdatum, Dokumentutskrift,
Leveransmottagare. Each field's value can appear on the same line as its
label or on one of the following few lines, so every field is checked both
ways.
"""

import re

# (metadata key, label(s) to search for, regex for the value, how many
#  following lines to check if the value isn't on the label's own line)
_FIELD_RULES = [
    ("Leveransmottagare", ("Leveransmottagare:",), r'Leveransmottagare:\s*(\d+)', r'^\d{3,}$'),
    ("Följesedelnr", ("Följesedelnr", "Transportnr"),
     r'(?:Följesedelnr|Transportnr)[:/]?\s*(\d{7,})', r'^\d{7,}$'),
    ("Leveransdatum", ("Leveransdatum",),
     r'Leveransdatum[:/]?\s*(\d{4}\.\d{2}\.\d{2})', r'^\d{4}\.\d{2}\.\d{2}'),
    ("Dokumentutskrift", ("Dokumentutskrift",),
     r'Dokumentutskrift[:/]?\s*(\d{4}\.\d{2}\.\d{2}\s+Kl\.\s+\d{2}:\d{2})',
     r'^\d{4}\.\d{2}\.\d{2}'),
]

_LOOKAHEAD_LINES = 3


def extract_metadata(text: str) -> dict | None:
    """Return a dict of header metadata found in `text`, or None if empty."""
    metadata: dict[str, str] = {}
    lines = text.split("\n")

    for i, line in enumerate(lines):
        for key, labels, same_line_pattern, next_line_pattern in _FIELD_RULES:
            if not any(label in line for label in labels):
                continue

            match = re.search(same_line_pattern, line)
            if match:
                metadata[key] = match.group(1)
                continue

            for j in range(i + 1, min(i + 1 + _LOOKAHEAD_LINES, len(lines))):
                next_line = lines[j].strip()
                if re.match(next_line_pattern, next_line):
                    metadata[key] = next_line
                    break

    return metadata or None
