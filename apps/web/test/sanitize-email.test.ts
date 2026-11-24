import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

(globalThis as any).__JSDOM = { JSDOM };

import {
  sanitizeEmailHtml,
  buildSandboxedEmailDocument,
  containsRemoteContent,
} from "../src/lib/sanitize-email.ts";

test("F03 Security: Strips active script tags completely", () => {
  const dirty = '<div>Hello<script>alert("XSS")</script> World</div>';
  const clean = sanitizeEmailHtml(dirty);

  assert.equal(clean.includes("<script>"), false, "Must not contain <script>");
  assert.equal(clean.includes("alert("), false, "Must not contain script payload");
  assert.equal(clean.includes("Hello"), true);
  assert.equal(clean.includes("World"), true);
});

test("F03 Security: Strips event handlers and malicious inline listeners", () => {
  const vectors = [
    '<img src="missing.jpg" onerror="alert(document.cookie)" />',
    '<a href="https://example.com" onclick="stealTokens()">Click</a>',
    '<div onmouseover="doEvil()" onfocus="doEvil()">Hover me</div>',
    '<svg onload="alert(1)"><circle cx="10" cy="10" r="5"/></svg>',
    '<body onload="alert(1)">Body payload</body>',
  ];

  for (const vector of vectors) {
    const clean = sanitizeEmailHtml(vector);
    assert.equal(/on[a-z]+/i.test(clean), false, `Event handler must be stripped from: ${vector}`);
    assert.equal(clean.includes("document.cookie"), false);
    assert.equal(clean.includes("stealTokens"), false);
    assert.equal(clean.includes("doEvil"), false);
  }
});

test("F03 Security: Strips unsafe javascript: and vbscript: URIs", () => {
  const dirty = '<a href="javascript:alert(1)">Click</a> and <a href="vbscript:msgbox(1)">VisualBasic</a>';
  const clean = sanitizeEmailHtml(dirty);

  assert.equal(clean.includes("javascript:"), false, "Must strip javascript: URI");
  assert.equal(clean.includes("vbscript:"), false, "Must strip vbscript: URI");
});

test("F03 Security: Strips dangerous embedded objects, frames, and forms", () => {
  const dirty = `
    <form action="https://phishing.com/login" method="POST">
      <input type="text" name="password" />
      <button type="submit">Submit</button>
    </form>
    <iframe src="https://evil.com"></iframe>
    <object data="https://evil.com/payload.swf"></object>
    <embed src="https://evil.com/payload.swf" />
    <base href="https://evil.com" />
  `;
  const clean = sanitizeEmailHtml(dirty);

  assert.equal(clean.includes("<form"), false, "Must strip <form>");
  assert.equal(clean.includes("<input"), false, "Must strip <input>");
  assert.equal(clean.includes("<iframe"), false, "Must strip <iframe>");
  assert.equal(clean.includes("<object"), false, "Must strip <object>");
  assert.equal(clean.includes("<embed"), false, "Must strip <embed>");
  assert.equal(clean.includes("<base"), false, "Must strip <base>");
});

test("F03 Security: Links are forced to target=_blank and rel=noopener noreferrer nofollow", () => {
  const dirty = '<a href="https://cellsweb.com">Visit CellsWeb</a>';
  const clean = sanitizeEmailHtml(dirty);

  assert.equal(clean.includes('target="_blank"'), true, "Must have target=_blank");
  assert.equal(
    clean.includes('rel="noopener noreferrer nofollow"'),
    true,
    "Must have rel=noopener noreferrer nofollow to prevent tabnabbing"
  );
});

test("F03 Privacy: Remote images are blocked by default and replaced with placeholder", () => {
  const dirty = '<p>Check photo:</p><img src="https://tracking.com/pixel.png" alt="Tracker" />';
  
  // 1. Blocked by default
  const cleanBlocked = sanitizeEmailHtml(dirty, { allowRemoteImages: false });
  assert.equal(
    cleanBlocked.includes("https://tracking.com/pixel.png"),
    false,
    "Must not leak remote image URL in src when blocked"
  );
  assert.equal(
    cleanBlocked.includes("data:image/svg+xml"),
    true,
    "Must replace src with placeholder SVG"
  );
  assert.equal(
    cleanBlocked.includes("[Blocked Remote Image]"),
    true
  );

  // 2. Allowed when explicitly requested
  const cleanAllowed = sanitizeEmailHtml(dirty, { allowRemoteImages: true });
  assert.equal(
    cleanAllowed.includes('src="https://tracking.com/pixel.png"'),
    true,
    "Must render remote image src when allowed"
  );
});

test("F03 Fidelity: Preserves legitimate email formatting and inline CID images", () => {
  const richEmail = `
    <h2>Meeting Summary</h2>
    <p>Dear <strong>Team</strong>, here is the <em>schedule</em>:</p>
    <table>
      <thead>
        <tr><th>Topic</th><th>Time</th></tr>
      </thead>
      <tbody>
        <tr><td>Architecture</td><td>10:00 AM</td></tr>
      </tbody>
    </table>
    <blockquote>Important decision noted here.</blockquote>
    <p><img src="cid:logo@cells.local" alt="Company Logo" /></p>
  `;

  const clean = sanitizeEmailHtml(richEmail, { allowRemoteImages: false });

  assert.equal(clean.includes("<h2>Meeting Summary</h2>"), true);
  assert.equal(clean.includes("<strong>Team</strong>"), true);
  assert.equal(clean.includes("<em>schedule</em>"), true);
  assert.equal(clean.includes("<table>"), true);
  assert.equal(clean.includes("<th>Topic</th>"), true);
  assert.equal(clean.includes("<td>Architecture</td>"), true);
  assert.equal(clean.includes("<blockquote>"), true);
  assert.equal(clean.includes('src="cid:logo@cells.local"'), true, "Inline CID images must be preserved");
});

test("F03 Remote Content Detection: Correctly detects external URLs", () => {
  assert.equal(containsRemoteContent('<img src="https://example.com/test.jpg">'), true);
  assert.equal(containsRemoteContent('<img src="http://example.com/test.jpg">'), true);
  assert.equal(containsRemoteContent('<img src="//example.com/test.jpg">'), true);
  assert.equal(containsRemoteContent('<div style="background-image: url(https://example.com/bg.png)"></div>'), true);
  assert.equal(containsRemoteContent('<link rel="stylesheet" href="https://example.com/style.css">'), true);

  // Plain emails or CID images
  assert.equal(containsRemoteContent('<p>Just plain text</p>'), false);
  assert.equal(containsRemoteContent('<img src="cid:logo123" />'), false);
  assert.equal(containsRemoteContent('<img src="data:image/png;base64,iVBORw0KGgo..." />'), false);
});

test("F03 Sandboxed Document: Emits restrictive CSP header and HTML shell", () => {
  const doc = buildSandboxedEmailDocument("<p>Hello Safe World</p>", {
    allowRemoteImages: false,
    isDark: true,
  });

  assert.equal(doc.includes("<!DOCTYPE html>"), true);
  assert.equal(doc.includes("<meta http-equiv=\"Content-Security-Policy\""), true);
  assert.equal(doc.includes("default-src 'none'"), true);
  assert.equal(doc.includes("frame-ancestors 'none'"), true);
  assert.equal(doc.includes("Hello Safe World"), true);
  assert.equal(doc.includes("color-scheme: dark"), true);
});


test("F03 DOM Execution Verification: Malicious payload in JSDOM cannot execute callbacks", () => {
  const dom = new JSDOM("<!DOCTYPE html><html><body><div id='root'></div></body></html>", {
    runScripts: "dangerously",
  });
  const window = dom.window;

  let scriptExecuted = false;
  (window as any).pwned = () => {
    scriptExecuted = true;
  };

  const maliciousPayload = `
    <img src="invalid.jpg" onerror="window.pwned()" />
    <script>window.pwned();</script>
    <a href="javascript:window.pwned()">Click</a>
  `;

  const clean = sanitizeEmailHtml(maliciousPayload);
  window.document.getElementById("root")!.innerHTML = clean;

  // Assert callback was never invoked in the DOM
  assert.equal(scriptExecuted, false, "Malicious callback must never execute in DOM");
  assert.equal(clean.includes("window.pwned"), false);
});
