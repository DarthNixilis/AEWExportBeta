// error-overlay.js
(() => {
  const MAX_LOG = 50;
  const log = [];

  function now() {
    return new Date().toISOString();
  }

  function safeStringify(obj) {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  function pushLog(entry) {
    log.push(entry);
    if (log.length > MAX_LOG) log.shift();
  }

  function ensureStyles() {
    if (document.getElementById("aew-error-overlay-styles")) return;
    const style = document.createElement("style");
    style.id = "aew-error-overlay-styles";
    style.textContent = `
      #aewErrorToastWrap {
        position: fixed;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      .aewToast {
        pointer-events: auto;
        background: rgba(20,20,20,0.95);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 10px 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      }
      .aewToastHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .aewToastTitle {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .aewToastTitle .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff4d4d;
      }
      .aewToastBody {
        font-size: 12px;
        line-height: 1.35;
        white-space: pre-wrap;
        word-break: break-word;
        opacity: 0.95;
      }
      .aewToastBtns {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .aewBtn {
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.08);
        color: #fff;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
      }
      .aewBtn:active { transform: translateY(1px); }
      .aewToastSmall {
        margin-top: 6px;
        font-size: 11px;
        opacity: 0.75;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureWrap() {
    let wrap = document.getElementById("aewErrorToastWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "aewErrorToastWrap";
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied", "Debug text copied to clipboard.", { level: "info", ttl: 1800 });
    } catch (e) {
      // fallback: prompt
      window.prompt("Copy debug text:", text);
    }
  }

  function showToast(title, body, opts = {}) {
    ensureStyles();
    const wrap = ensureWrap();

    const toast = document.createElement("div");
    toast.className = "aewToast";

    const header = document.createElement("div");
    header.className = "aewToastHeader";

    const titleWrap = document.createElement("div");
    titleWrap.className = "aewToastTitle";

    const dot = document.createElement("span");
    dot.className = "dot";
    if (opts.level === "warn") dot.style.background = "#ffb020";
    if (opts.level === "info") dot.style.background = "#4da3ff";

    const titleEl = document.createElement("div");
    titleEl.textContent = title;

    titleWrap.appendChild(dot);
    titleWrap.appendChild(titleEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "aewBtn";
    closeBtn.textContent = "Close";
    closeBtn.onclick = () => toast.remove();

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    const bodyEl = document.createElement("div");
    bodyEl.className = "aewToastBody";
    bodyEl.textContent = body;

    toast.appendChild(header);
    toast.appendChild(bodyEl);

    if (opts.debugText) {
      const btns = document.createElement("div");
      btns.className = "aewToastBtns";

      const copyBtn = document.createElement("button");
      copyBtn.className = "aewBtn";
      copyBtn.textContent = "Copy Debug";
      copyBtn.onclick = () => copyText(opts.debugText);

      const dlBtn = document.createElement("button");
      dlBtn.className = "aewBtn";
      dlBtn.textContent = "Download Log";
      dlBtn.onclick = () => {
        const blob = new Blob([opts.debugText], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "aew-debug-log.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 500);
      };

      btns.appendChild(copyBtn);
      btns.appendChild(dlBtn);
      toast.appendChild(btns);

      const small = document.createElement("div");
      small.className = "aewToastSmall";
      small.textContent = "Tip: if this repeats after an update, add ?v=123 to the URL to bust cache.";
      toast.appendChild(small);
    }

    wrap.appendChild(toast);

    const ttl = typeof opts.ttl === "number" ? opts.ttl : 0;
    if (ttl > 0) setTimeout(() => toast.remove(), ttl);
  }

  function formatErrorPayload(payload) {
    const lines = [];
    lines.push(`[${payload.time}] ${payload.type}`);
    if (payload.message) lines.push(`Message: ${payload.message}`);
    if (payload.source) lines.push(`Source: ${payload.source}`);
    if (payload.filename) lines.push(`File: ${payload.filename}`);
    if (payload.lineno != null) lines.push(`Line: ${payload.lineno}`);
    if (payload.colno != null) lines.push(`Col: ${payload.colno}`);
    if (payload.stack) lines.push(`Stack:\n${payload.stack}`);
    if (payload.extra) lines.push(`Extra:\n${safeStringify(payload.extra)}`);
    return lines.join("\n");
  }

  function report(payload, show = true) {
    const entry = { ...payload, time: payload.time || now() };
    pushLog(entry);

    if (!show) return;

    const debugText = [
      "AEW TCG Deck Constructor Debug Log",
      `URL: ${location.href}`,
      `UA: ${navigator.userAgent}`,
      "",
      ...log.map(formatErrorPayload),
    ].join("\n\n---\n\n");

    showToast(
      payload.title || "App Error",
      payload.message || "Something went wrong. Tap Copy Debug and send it to the dev (you).",
      { level: payload.level || "error", debugText }
    );
  }

  // Public API
  window.AEWError = {
    show: (title, message, level = "error", extra = null) =>
      report({ type: "manual", title, message, level, extra }),
    log: () => [...log],
    exportText: () =>
      [
        "AEW TCG Deck Constructor Debug Log",
        `URL: ${location.href}`,
        `UA: ${navigator.userAgent}`,
        "",
        ...log.map(formatErrorPayload),
      ].join("\n\n---\n\n"),
  };

  // Global error hooks
  window.addEventListener("error", (event) => {
    report({
      type: "window.error",
      title: "JavaScript Error",
      message: event.message || "Unknown error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    report({
      type: "unhandledrejection",
      title: "Promise Rejection",
      message: reason?.message || String(reason) || "Unhandled rejection",
      stack: reason?.stack,
      extra: reason && !reason.stack ? reason : null,
    });
  });

  // Fetch wrapper to surface 404/500 and JSON parse failures
  const _fetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    try {
      const res = await _fetch(...args);
      if (!res.ok) {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
        report({
          type: "fetch",
          title: "Network Error",
          message: `Fetch failed (${res.status} ${res.statusText}) for: ${url || "unknown URL"}`,
          level: "warn",
          extra: { status: res.status, statusText: res.statusText, url },
        });
      }
      return res;
    } catch (e) {
      report({
        type: "fetch",
        title: "Network Exception",
        message: e?.message || String(e),
        stack: e?.stack,
      });
      throw e;
    }
  };
})();
