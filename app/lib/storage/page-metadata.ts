const DIAGRAM_TAG_REGEX = /<diagram\b([^>]*)>/gi;

export interface DrawioPageInfo {
  id: string;
  name: string;
  index: number;
}

export interface PageMetadataSummary {
  pageCount: number;
  pageNames: string[];
  pages: DrawioPageInfo[];
}

const DEFAULT_PAGE_NAME = "Page";
const DEFAULT_PAGE_ID_PREFIX = "page-";

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizePageName(rawName: string | undefined, index: number): string {
  if (!rawName) {
    return `${DEFAULT_PAGE_NAME} ${index + 1}`;
  }

  const decoded = decodeXmlEntities(rawName).trim();
  if (decoded.length === 0) {
    return `${DEFAULT_PAGE_NAME} ${index + 1}`;
  }
  return decoded;
}

function normalizePageId(rawId: string | undefined, index: number): string {
  if (!rawId) {
    return `${DEFAULT_PAGE_ID_PREFIX}${index + 1}`;
  }

  const decoded = decodeXmlEntities(rawId).trim();
  if (decoded.length === 0) {
    return `${DEFAULT_PAGE_ID_PREFIX}${index + 1}`;
  }
  return decoded;
}

function extractAttribute(attrs: string, attrName: string): string | undefined {
  const regex = new RegExp(
    `${attrName}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')`,
    "i",
  );
  const match = attrs.match(regex);
  return match?.[1] ?? match?.[2] ?? undefined;
}

export function extractPagesFromXml(xml: string): DrawioPageInfo[] {
  const pages: DrawioPageInfo[] = [];
  if (!xml || xml.trim().length === 0) {
    return pages;
  }

  DIAGRAM_TAG_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DIAGRAM_TAG_REGEX.exec(xml)) !== null) {
    const attrs = match[1] ?? "";
    const index = pages.length;
    const rawId = extractAttribute(attrs, "id");
    const rawName = extractAttribute(attrs, "name");

    pages.push({
      id: normalizePageId(rawId, index),
      name: normalizePageName(rawName, index),
      index,
    });
  }

  return pages;
}

export function buildPageMetadataFromXml(
  xml: string | null | undefined,
): PageMetadataSummary {
  const pages = extractPagesFromXml(xml ?? "");
  if (pages.length === 0) {
    const defaultPage: DrawioPageInfo = {
      id: "page-1",
      name: "Page 1",
      index: 0,
    };

    return {
      pageCount: 1,
      pageNames: [defaultPage.name],
      pages: [defaultPage],
    };
  }

  return {
    pageCount: pages.length,
    pageNames: pages.map((page) => page.name),
    pages,
  };
}
