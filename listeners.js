// listeners.js
// ES module: app-init.js expects initializeAllEventListeners to be exported.

import {
  generateLackeyCCGDeck,
  generatePlainTextDeck,
  exportDeckAsImage
} from "./exporter.js";

function showErr(title, err) {
  window.AEWError?.show(
    title,
    err?.message || String(err),
    "error",
    { stack: err?.stack }
  );
}

function byId(id) {
  return document.getElementById(id);
}

function setOutputText(text) {
  const out = byId("exportOutput");
  if (out) out.value = String(text ?? "");
}

function safeCall(label, fn, writeOutput = true) {
  try {
    if (typeof fn !== "function") {
      throw new Error(`${label} exporter is not a function.`);
    }
    const result = fn();

    // Most exporters return a string; show it if available
    if (writeOutput && typeof result === "string") {
      setOutputText(result);
    }

    return result;
  } catch (e) {
    showErr(`${label} Failed`, e);
    return null;
  }
}

function wireButton(id, handler) {
  const btn = byId(id);
  if (!btn) return false;
  btn.addEventListener("click", handler);
  return true;
}

/**
 * This is the function app-init.js imports and calls.
 * It should be safe to call even if some buttons/inputs don't exist.
 */
export function initializeAllEventListeners() {
  // Export buttons (IDs you can standardize in your HTML)
  wireButton("btnExportPlainText", () => safeCall("Plain Text Export", generatePlainTextDeck, true));
  wireButton("btnExportLackey", () => safeCall("Lackey Export", generateLackeyCCGDeck, true));
  wireButton("btnExportImage", () => safeCall("Image Export", exportDeckAsImage, false));

  // Your earlier index wiring used this ID too, so support it:
  wireButton("btnTestExport", () => safeCall("TEST EXPORT (Lackey)", generateLackeyCCGDeck, true));

  // Copy debug log button (optional)
  wireButton("btnCopyDebug", async () => {
    try {
      const text = window.AEWError?.exportText?.() || "No AEWError log available yet.";
      await navigator.clipboard.writeText(text);
      window.AEWError?.show("Copied", "Debug log copied to clipboard.", "info");
    } catch {
      const text = window.AEWError?.exportText?.() || "No AEWError log available yet.";
      window.prompt("Copy debug log:", text);
    }
  });

  // If you have other UI listeners in the original listeners.js (filters, search, add/remove cards),
  // we can re-add them here safely once exports/imports are stable.
}

// Optional: also auto-init if someone loads listeners.js directly without app-init.js.
// This will NOT break app-init.js, it just makes the module usable standalone.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    try { initializeAllEventListeners(); } catch (e) { showErr("Listener Init Failed", e); }
  });
} else {
  try { initializeAllEventListeners(); } catch (e) { showErr("Listener Init Failed", e); }
}
