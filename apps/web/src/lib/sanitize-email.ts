import createDOMPurify from "dompurify";

type DOMPurifyInstance = ReturnType<typeof createDOMPurify>;

export interface SanitizeEmailOptions {
  allowRemoteImages?: boolean;
  isDark?: boolean;
}

let _cachedPurify: DOMPurifyInstance | null = null;

function getPurify(): DOMPurifyInstance {
  if (_cachedPurify) return _cachedPurify;

  if (typeof window !== "undefined") {
    _cachedPurify = createDOMPurify(window);
  } else {
    // In Node.js / test runner environments
    try {
      // Dynamic import / require to prevent Webpack client-bundling issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createRequire } = require("node:module");
      const req = createRequire(import.meta.url);
      const { JSDOM } = req("jsdom");
      const dom = new JSDOM("");
      _cachedPurify = createDOMPurify(dom.window as any);
    } catch {
      try {
        // Fallback for native Node ESM
        const { JSDOM } = (globalThis as any).__JSDOM || {};
        if (JSDOM) {
          _cachedPurify = createDOMPurify(new JSDOM("").window as any);
        } else {
          _cachedPurify = createDOMPurify();
        }
      } catch {
        _cachedPurify = createDOMPurify();
      }
    }
  }

  return _cachedPurify;
}

/**
 * Checks whether an HTML string references external resources
 * (remote images, CSS url() references, external stylesheets, tracking pixels).
 */
export function containsRemoteContent(html: string): boolean {
  if (!html) return false;

  // Check <img> src starting with http:, https:, or protocol-relative //
  const hasRemoteImg = /<img[^>]+src=["']\s*(?:https?:)?\/\//i.test(html);
  // Check CSS url() referencing remote http/https
  const hasRemoteCssUrl = /url\(\s*["']?\s*(?:https?:)?\/\//i.test(html);
  // Check <link rel="stylesheet">
  const hasExternalStyle = /<link[^>]+rel=["']?stylesheet/i.test(html);

  return hasRemoteImg || hasRemoteCssUrl || hasExternalStyle;
}

/**
 * Sanitizes untrusted email HTML using DOMPurify with an email-safe allowlist.
 * Guarantees no executable scripts, active attributes, forms, or dangerous tags survive.
 */
export function sanitizeEmailHtml(
  rawHtml: string,
  options: SanitizeEmailOptions = {}
): string {
  if (!rawHtml) return "";

  const purify = getPurify();
  const allowRemote = Boolean(options.allowRemoteImages);

  // Configure DOMPurify hooks for email safety
  if (typeof purify.removeHook === "function") {
    purify.removeHook("afterSanitizeAttributes");
    purify.addHook("afterSanitizeAttributes", (node) => {
      // 1. Force target="_blank" and rel="noopener noreferrer nofollow" on all links to prevent tabnabbing
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer nofollow");

        // Validate href protocol: strictly allow only safe schemes
        const href = node.getAttribute("href");
        if (href) {
          const trimmed = href.trim().toLowerCase();
          if (
            !trimmed.startsWith("http://") &&
            !trimmed.startsWith("https://") &&
            !trimmed.startsWith("mailto:") &&
            !trimmed.startsWith("tel:") &&
            !trimmed.startsWith("#")
          ) {
            node.removeAttribute("href");
          }
        }
      }

      // 2. Handle <img> tags: block remote images unless explicitly allowed
      if (node.tagName === "IMG") {
        const src = node.getAttribute("src") || "";
        const trimmedSrc = src.trim().toLowerCase();
        const isRemote =
          trimmedSrc.startsWith("http://") ||
          trimmedSrc.startsWith("https://") ||
          trimmedSrc.startsWith("//");

        if (isRemote && !allowRemote) {
          // Replace with inert placeholder
          node.setAttribute(
            "src",
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='24' viewBox='0 0 100 24'><rect width='100' height='24' rx='4' fill='%23f3f4f6'/><text x='50' y='16' font-size='10' font-family='sans-serif' fill='%239ca3af' text-anchor='middle'>[Blocked Image]</text></svg>"
          );
          node.setAttribute("alt", "[Blocked Remote Image]");
        }
      }
    });
  }

  const clean = purify.sanitize(rawHtml, {
    // Explicit tag allowlist suitable for rich email formatting
    ALLOWED_TAGS: [
      "a", "abbr", "b", "bdi", "bdo", "blockquote", "br", "caption",
      "cite", "code", "col", "colgroup", "dd", "del", "details", "dfn",
      "div", "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3",
      "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "mark",
      "ol", "p", "pre", "q", "rp", "rt", "ruby", "s", "samp", "small",
      "span", "strong", "sub", "summary", "sup", "table", "tbody", "td",
      "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "wbr"
    ],
    // Explicit attribute allowlist (no on* event handlers)
    ALLOWED_ATTR: [
      "align", "alt", "bgcolor", "border", "cellpadding", "cellspacing",
      "class", "color", "colspan", "dir", "height", "href", "id", "lang",
      "loading", "name", "rel", "rowspan", "scope", "src", "style",
      "target", "title", "valign", "width"
    ],
    // Only permit safe URI schemes (strictly no javascript:, vbscript:)
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|cid):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Block forms, objects, script, and base
    FORBID_TAGS: [
      "script", "style", "iframe", "frame", "object", "embed", "applet",
      "form", "input", "button", "select", "textarea", "base", "meta",
      "link", "title"
    ],
    FORBID_ATTR: [
      "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur",
      "onchange", "onsubmit", "formaction", "xlink:href"
    ],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });

  if (typeof purify.removeHook === "function") {
    purify.removeHook("afterSanitizeAttributes");
  }

  return clean as string;
}

/**
 * Builds a complete, standalone, CSP-isolated HTML document for injection
 * into an opaque, sandboxed <iframe sandbox="allow-popups allow-popups-to-escape-sandbox">.
 */
export function buildSandboxedEmailDocument(
  rawHtml: string,
  options: SanitizeEmailOptions = {}
): string {
  const sanitizedBody = sanitizeEmailHtml(rawHtml, options);
  const isDark = Boolean(options.isDark);
  const allowRemote = Boolean(options.allowRemoteImages);

  // Restrictive Content Security Policy for the iframe document
  const csp = allowRemote
    ? "default-src 'none'; style-src 'unsafe-inline'; img-src https: http: data: cid:; font-src https: data:; frame-ancestors 'none';"
    : "default-src 'none'; style-src 'unsafe-inline'; img-src data: cid:; font-src data:; frame-ancestors 'none';";

  const textColor = isDark ? "#e5e7eb" : "#111827";
  const linkColor = isDark ? "#60a5fa" : "#2563eb";
  const borderColor = isDark ? "#374151" : "#e5e7eb";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    :root {
      color-scheme: ${isDark ? "dark" : "light"};
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: ${textColor};
      background-color: transparent;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: ${linkColor};
      text-decoration: underline;
    }
    table {
      max-width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border-color: ${borderColor};
    }
    pre, code {
      white-space: pre-wrap;
      word-break: break-all;
    }
    blockquote {
      margin: 1em 0;
      padding-left: 12px;
      border-left: 3px solid ${borderColor};
      color: ${isDark ? "#9ca3af" : "#6b7280"};
    }
  </style>
</head>
<body>
  ${sanitizedBody}
</body>
</html>`;
}
