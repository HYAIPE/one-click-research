import {
  MAX_QUERY_LENGTH,
  TAB_GROUP_TITLE_PREFIX,
  TAB_GROUP_TITLE_QUERY_LENGTH,
} from "./constants";

/**
 * Normalizes selected text into a searchable query: collapses all whitespace
 * (including line breaks) into single spaces, trims, and caps extreme lengths.
 * Returns null when nothing searchable remains.
 */
export function normalizeQuery(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return null;
  const chars = [...collapsed];
  if (chars.length <= MAX_QUERY_LENGTH) return collapsed;
  return chars.slice(0, MAX_QUERY_LENGTH).join("").trimEnd();
}

/**
 * Builds a concise tab group title: "RESEARCH: <query>", truncated at a word
 * boundary when the query is long. Iterates code points so emoji and other
 * surrogate pairs are never split.
 */
export function buildGroupTitle(query: string): string {
  const chars = [...query];
  if (chars.length <= TAB_GROUP_TITLE_QUERY_LENGTH) {
    return TAB_GROUP_TITLE_PREFIX + query;
  }
  const truncated = chars.slice(0, TAB_GROUP_TITLE_QUERY_LENGTH).join("");
  const lastSpace = truncated.lastIndexOf(" ");
  const cut =
    lastSpace > TAB_GROUP_TITLE_QUERY_LENGTH / 2 ? truncated.slice(0, lastSpace) : truncated;
  return `${TAB_GROUP_TITLE_PREFIX}${cut.trimEnd()}...`;
}
