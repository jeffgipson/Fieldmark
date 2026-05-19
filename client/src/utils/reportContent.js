/** Plain-text display for lender report fields (handles legacy HTML/JSON blobs). */

function stripHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function tryParseJson(text) {
  const raw = String(text).trim();
  if (!raw.startsWith("{") && !raw.startsWith("[")) return null;
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const LIST_ITEM_KEYS = ["finding", "text", "description", "detail", "message", "title", "body"];

export function formatReportParagraph(value) {
  if (value == null || value === "") return "";

  if (typeof value === "object" && !Array.isArray(value)) {
    return formatReportParagraph(value.summary || value.lender_narrative || "");
  }

  let text = String(value);
  const parsed = tryParseJson(text);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return formatReportParagraph(parsed.summary || parsed.lender_narrative || "");
  }

  return stripHtml(text);
}

export function formatReportListItem(item) {
  if (item == null) return "";

  if (typeof item === "string") {
    const parsed = tryParseJson(item);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return formatReportListItem(parsed.finding || parsed.text || parsed);
    }
    return stripHtml(item);
  }

  if (typeof item === "object") {
    const key = LIST_ITEM_KEYS.find((k) => item[k]);
    if (key) return stripHtml(String(item[key]));
    return stripHtml(Object.values(item).filter(Boolean).join(" — "));
  }

  return stripHtml(String(item));
}

export function formatReportList(items) {
  if (!Array.isArray(items)) return [];
  return items.map(formatReportListItem).filter(Boolean);
}
