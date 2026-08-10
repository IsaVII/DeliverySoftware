// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------
// Single source of truth for the five delivery statuses. Drives the initial
// filter state, the filter buttons, and the status counts, instead of
// keeping four/five separate hardcoded lists in sync by hand.
export const STATUS_FILTERS_CONFIG = [
  {
    key: "unchecked",
    label: "Unchecked",
    colorVar: "--status-color-unchecked",
  },
  {
    key: "not-delivered",
    label: "Not delivered",
    colorVar: "--status-color-not-delivered",
  },
  {
    key: "partly-delivered",
    label: "Partially delivered",
    colorVar: "--status-color-partly-delivered",
  },
  {
    key: "all-delivered",
    label: "Fully delivered",
    colorVar: "--status-color-all-delivered",
  },
  {
    key: "too-many",
    label: "Too many",
    colorVar: "--status-color-too-many",
  },
];

// Literal Tailwind arbitrary-value class strings, kept as full strings (not
// built via template interpolation) so the build's class scanner can find
// them. "unchecked" has no special background, so it's omitted here and
// falls back to the base row classes.
const STATUS_ROW_CLASSES = {
  "all-delivered":
    "hover:bg-[var(--table-bg-delivered-hover)] bg-[var(--table-bg-delivered)]",
  "too-many":
    "hover:bg-[var(--table-bg-more-than-delivered-hover)] bg-[var(--table-bg-more-than-delivered)]",
  "not-delivered":
    "hover:bg-[var(--table-bg-not-delivered-hover)] bg-[var(--table-bg-not-delivered)]",
  "partly-delivered":
    "hover:bg-[var(--table-bg-partially-delivered-hover)] bg-[var(--table-bg-partially-delivered)]",
};

export function isPfandArticle(article) {
  const description = (article.Beskrivning || "").toUpperCase();
  return description.includes("PANT");
}

export function getRowStatus(article) {
  const { received } = article;
  const kfp = parseFloat(article.KFP);

  if (received === -1) return "unchecked"; // Default/unchecked
  if (received === 0) return "not-delivered"; // Not delivered
  if (received < kfp) return "partly-delivered"; // Partly delivered
  if (received === kfp) return "all-delivered"; // All delivered
  if (received > kfp) return "too-many"; // Too many delivered (received > kfp)
  return "unchecked"; // Fallback case, should not happen
}

export function getRowClassName(status) {
  const baseClasses =
    "min-h-[50px] border-b-1 border-[var(--border)] hover:bg-[var(--bg-entry-hover)]";
  const statusClasses = STATUS_ROW_CLASSES[status];
  return statusClasses ? `${baseClasses} ${statusClasses}` : baseClasses;
}

export function getStatusCounts(articles, excludePfand = false) {
  const counts = Object.fromEntries(
    STATUS_FILTERS_CONFIG.map(({ key }) => [key, 0]),
  );
  articles.forEach((article) => {
    if (excludePfand && isPfandArticle(article)) return;
    counts[getRowStatus(article)]++;
  });
  return counts;
}

export function getPfandCount(articles) {
  return articles.filter((article) => isPfandArticle(article)).length;
}

export function getBarcodeCounts(articles) {
  let withBarcode = 0;
  let withoutBarcode = 0;
  articles.forEach((article) => {
    if (article.Streckkod && article.Streckkod.trim() !== "") {
      withBarcode++;
    } else {
      withoutBarcode++;
    }
  });
  return { withBarcode, withoutBarcode, total: articles.length };
}

export function getCommentCounts(articles) {
  let withComment = 0;
  articles.forEach((article) => {
    if (article.comment && article.comment.trim() !== "") {
      withComment++;
    }
  });
  return { withComment, total: articles.length };
}
