import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  List,
  Link,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageInsert,
  ImageUpload,
  Undo,
} from "ckeditor5";
const ALLOWED_TAGS = new Set([
  "a",
  "blockquote",
  "br",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "img",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);
const BLOCK_TAGS = new Set(["blockquote", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ol", "p", "ul"]);
const URL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtmlMarkup(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value));
}

function textToHtml(value = "") {
  const lines = String(value).split(/\r?\n/);
  if (!lines.some((line) => line.trim())) return "";
  return lines
    .map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>"))
    .join("");
}

function sanitizeUrl(rawUrl = "", { allowImageData = false } = {}) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  if (allowImageData && /^data:image\//i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;

  try {
    const parsed = new URL(value, window.location.origin);
    return URL_PROTOCOLS.includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function sanitizeNode(node, documentRef) {
  if (node.nodeType === Node.TEXT_NODE) {
    return documentRef.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tagName = node.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = documentRef.createDocumentFragment();
    Array.from(node.childNodes).forEach((childNode) => {
      const sanitizedChild = sanitizeNode(childNode, documentRef);
      if (sanitizedChild) fragment.appendChild(sanitizedChild);
    });
    return fragment;
  }

  const safeElement = documentRef.createElement(tagName);

  if (tagName === "a") {
    const href = sanitizeUrl(node.getAttribute("href"));
    if (href) {
      safeElement.setAttribute("href", href);
      safeElement.setAttribute("target", "_blank");
      safeElement.setAttribute("rel", "noopener noreferrer nofollow");
    }
  }

  if (tagName === "img") {
    const src = sanitizeUrl(node.getAttribute("src"), { allowImageData: true });
    if (!src) return null;
    safeElement.setAttribute("src", src);
    safeElement.setAttribute("alt", node.getAttribute("alt") || "Ảnh mô tả thẻ");
  }

  if (tagName === "figure") {
    const className = (node.getAttribute("class") || "")
      .split(/\s+/)
      .filter((name) => /^image(-style-[a-z-]+)?$/i.test(name) || name === "image")
      .join(" ");
    if (className) safeElement.setAttribute("class", className);
  }

  Array.from(node.childNodes).forEach((childNode) => {
    const sanitizedChild = sanitizeNode(childNode, documentRef);
    if (sanitizedChild) safeElement.appendChild(sanitizedChild);
  });

  if (BLOCK_TAGS.has(tagName) && !safeElement.childNodes.length) {
    safeElement.appendChild(documentRef.createElement("br"));
  }

  return safeElement;
}

export function normalizeDescriptionForEditor(value = "") {
  const raw = String(value || "");
  return hasHtmlMarkup(raw) ? raw : textToHtml(raw);
}

export function descriptionToPlainText(value = "") {
  const raw = String(value || "");
  if (!raw) return "";
  if (!hasHtmlMarkup(raw)) return raw;

  const parsed = new DOMParser().parseFromString(raw, "text/html");
  return (parsed.body.textContent || "").trim();
}

export function sanitizeDescriptionHtml(value = "") {
  const normalized = normalizeDescriptionForEditor(value);
  if (!normalized) return "";

  const parser = new DOMParser();
  const parsed = parser.parseFromString(normalized, "text/html");
  const cleanDocument = document.implementation.createHTMLDocument("");
  const fragment = cleanDocument.createDocumentFragment();

  Array.from(parsed.body.childNodes).forEach((childNode) => {
    const sanitizedChild = sanitizeNode(childNode, cleanDocument);
    if (sanitizedChild) fragment.appendChild(sanitizedChild);
  });

  const container = cleanDocument.createElement("div");
  container.appendChild(fragment);
  return container.innerHTML;
}

export function isDescriptionEffectivelyEmpty(value = "") {
  const sanitized = sanitizeDescriptionHtml(value);
  if (!sanitized) return true;

  const parsed = new DOMParser().parseFromString(sanitized, "text/html");
  const bodyText = (parsed.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .trim();
  const hasImage = parsed.body.querySelector("img");

  return !bodyText && !hasImage;
}

export function loadCkeditorCloud() {
  class LocalClassicEditor extends ClassicEditor {}

  LocalClassicEditor.builtinPlugins = [
    Essentials,
    Paragraph,
    Bold,
    Italic,
    Heading,
    List,
    Link,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageInsert,
    ImageUpload,
    Undo,
  ];

  return Promise.resolve(LocalClassicEditor);
}