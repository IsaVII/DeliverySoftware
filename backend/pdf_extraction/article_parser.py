"""Parses the delivery/article table from a delivery-note PDF's text.

Each delivery starts with a line containing only a 9-digit delivery number,
followed by one article line per row until the next delivery number (or the
end of the document).
"""

import re

_HEADER_MARKERS = (
    "Leveransmottagare", "Följesedel", "Shop", "Leveransdatum",
    "Dokumentutskrift", "Leveransnr Rad",
)
_DELIVERY_NR_RE = re.compile(r'^\d{9}$')
_ARTICLE_LINE_RE = re.compile(r'^\d+\s+\d+')
_PRICE_RE = re.compile(r'(\d+\.?\d*)/(\w+)')
_UNIT_CODE_RE = re.compile(r'^(K\d+|ST|KG|L|ML|BOX|ASK|PK|DZ|PAK)$')


def parse_delivery_data(text: str) -> dict:
    """Parse the full delivery-note text into a dict with deliveries and not-delivered items."""
    deliveries: list[dict] = []
    not_delivered: list[dict] = []
    
    if not text:
        return {"deliveries": deliveries, "not_delivered": not_delivered}

    # Split text into sections: main deliveries and "Ej levererat" (not delivered)
    ej_levererat_marker = "Ej levererat"
    if ej_levererat_marker in text:
        main_text, not_delivered_text = text.split(ej_levererat_marker, 1)
    else:
        main_text = text
        not_delivered_text = ""

    # Parse main deliveries
    current_delivery = None
    current_articles: list[dict] = []

    for raw_line in main_text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue

        if any(marker in raw_line for marker in _HEADER_MARKERS):
            continue

        if _DELIVERY_NR_RE.match(line):
            if current_delivery is not None and current_articles:
                current_delivery["articles"] = current_articles
                deliveries.append(current_delivery)

            current_delivery = {"leveransnr": line}
            current_articles = []

        elif current_delivery is not None and _ARTICLE_LINE_RE.match(line):
            article = parse_article_line(line)
            if article:
                current_articles.append(article)

    if current_delivery is not None and current_articles:
        current_delivery["articles"] = current_articles
        deliveries.append(current_delivery)

    # Parse not-delivered items if section exists
    if not_delivered_text:
        not_delivered = parse_not_delivered_section(not_delivered_text)

    return {"deliveries": deliveries, "not_delivered": not_delivered}


def parse_article_line(line: str) -> dict | None:
    """Parse a single article row.

    Format: Rad Artikelnr Beskrivning Kvant Enh KFP A-pris Price RekPris
            Marginal Nettopris Referens

    Example: "10 101214727 FRE PASTASALLAD450G OS/S 1 K01 4 39.53/ST 70.93 40.93 158.12"
    """
    price_match = _PRICE_RE.search(line)
    if not price_match:
        return None

    parts = line.split()
    if len(parts) < 8:
        return None

    rad = parts[0]
    artikelnr = parts[1]

   # Find the price position to work backwards from
    price_part_idx = -1
    for i, part in enumerate(parts):
        if part == price_match.group(0):
            price_part_idx = i
            break

    if price_part_idx == -1:
        return None

    # Work backwards from the price to identify the structured fields:
    # ... Beskrivning Kvant Enh KFP Price ...
    # The 3 fields immediately before Price are: KFP, Enh, Kvant
    if price_part_idx < 3:
        return None

    kvant = parts[price_part_idx - 3]
    enh = parts[price_part_idx - 2]
    kfp = parts[price_part_idx - 1]

    # Everything from index 2 to kvant is the description
    desc_end_idx = price_part_idx - 3
    beskrivning = " ".join(parts[2:desc_end_idx])
    kvant = parts[desc_end_idx] if desc_end_idx < len(parts) else ""
    enh = parts[desc_end_idx + 1] if desc_end_idx + 1 < len(parts) else ""
    kfp = parts[desc_end_idx + 2] if desc_end_idx + 2 < len(parts) else ""

    price_with_unit = price_match.group(0)
    right_parts = line[price_match.end():].strip().split()

    return {
        "Rad": rad,
        "Artikelnr": artikelnr,
        "Beskrivning": beskrivning,
        "Kvant": kvant,
        "Enh": enh,
        "KFP": kfp,
        "Price": price_with_unit,  # A-pris with unit, e.g. "39.53/ST"
        "RekPris": right_parts[0] if len(right_parts) > 0 else "",
        "Marginal": right_parts[1] if len(right_parts) > 1 else "",
        "Nettopris": right_parts[2] if len(right_parts) > 2 else "",
        "referens": right_parts[3] if len(right_parts) > 3 else "",
        "received": -1,  # Placeholder until updated via the app
    }


def parse_not_delivered_section(text: str) -> list[dict]:
    """Parse the 'Ej levererat' (Not delivered) section.
    
    Format: Huvudgrupp Artikelnr Beskrivning BestKvänt Enh BestKFP Restadkvänt Enh Bristorsak Referens
    
    Example: "FRUKT/GRÖNT KN 101854016 NEKTARIN 2 K10 14 0 K10 SLUT LAGER 30803943"
    """
    not_delivered_items: list[dict] = []
    
    if not text:
        return not_delivered_items
    
    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        
        # Skip header lines and summary lines
        if any(marker in line for marker in ["Huvudgrupp", "Antal varurader", "Totalt", "SEK"]):
            continue
        
        parts = line.split()
        if len(parts) < 6:
            continue
        
        # Try to find artikelnr (should be a 9-digit number after huvudgrupp)
        artikelnr_idx = -1
        for i in range(1, min(3, len(parts))):
            if parts[i].isdigit() and len(parts[i]) >= 8:
                artikelnr_idx = i
                break
        
        if artikelnr_idx == -1:
            continue
        
        huvudgrupp = " ".join(parts[:artikelnr_idx])
        artikelnr = parts[artikelnr_idx]
        
        # Find description end: where we hit a number followed by unit code or another number
        desc_end_idx = artikelnr_idx + 1
        for i in range(artikelnr_idx + 1, len(parts) - 2):
            # Look for pattern: quantity, unit, quantity pattern
            if (parts[i].replace(".", "", 1).isdigit() and 
                (parts[i + 1].isalpha() or _UNIT_CODE_RE.match(parts[i + 1]))):
                desc_end_idx = i
                break
        
        beskrivning = " ".join(parts[artikelnr_idx + 1:desc_end_idx])
        
        # Extract the remaining fields: best_kvant, enh, best_kfp, restd_kvant, enh, bristorsak, referens
        remaining_parts = parts[desc_end_idx:]
        
        item = {
            "huvudgrupp": huvudgrupp,
            "Artikelnr": artikelnr,
            "Beskrivning": beskrivning,
            "BestKvänt": remaining_parts[0] if len(remaining_parts) > 0 else "",
            "BestEnh": remaining_parts[1] if len(remaining_parts) > 1 else "",
            "BestKFP": remaining_parts[2] if len(remaining_parts) > 2 else "",
            "RestadKvänt": remaining_parts[3] if len(remaining_parts) > 3 else "",
            "RestadEnh": remaining_parts[4] if len(remaining_parts) > 4 else "",
            "Bristorsak": " ".join(remaining_parts[5:-1]) if len(remaining_parts) > 6 else (remaining_parts[5] if len(remaining_parts) > 5 else ""),
            "Referens": remaining_parts[-1] if len(remaining_parts) > 5 else "",
        }
        
        not_delivered_items.append(item)
    
    return not_delivered_items
