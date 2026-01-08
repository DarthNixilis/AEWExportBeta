// listeners.js
// Centralized UI event wiring for exporter buttons
// ES module — imported by main.js

import {
  generateLackeyCCGDeck,
  generatePlainTextDeck,
  exportDeckAsImage
} from "./exporter.js";

/* ----------------------------- Utilities ----------------------------- */

function safeRun(label, fn, outputEl = null) {
  try {
    if (typeof fn !== "function") {
      throw new Error(`${label} exporter is not a function.`);
    }

    const result = fn();

    if (outputEl && typeof result === "string") {
      outputEl.value = result;
    }

    return result;
  } catch (err) {
    window.AEWError?.show(
      `${label} Export Failed`,
      err?.message || String(err),
      "error",
      { stack: err?.stack }
    );
  }
}

function byId(id) {
  return document.getElementById(id);
}

/* ----------------------------- DOM Ready ----------------------------- */

function wireExportButtons() {
  const plainTextOutput = byId("exportOutput");

  // Plain text export
  const btnPlainText = byId("btnExportPlainText");
  if (btnPlainText) {
    btnPlainText.addEventListener("click", () =>
      safeRun("Plain Text", generatePlainTextDeck, plainTextOutput)
    );
  }

  // Lackey export
  const btnLackey = byId("btnExportLackey");
  if (btnLackey) {
    btnLackey.addEventListener("click", () =>
      safeRun("Lackey", generateLackeyCCGDeck, plainTextOutput)
    );
  }

  // Image export (does not return text)
  const btnImage = byId("btnExportImage");
  if (btnImage) {
    btnImage.addEventListener("click", () =>
      safeRun("Image", exportDeckAsImage)
    );
  }
}

/* ----------------------------- Init ----------------------------- */

// Defer wiring until DOM exists
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireExportButtons);
} else {
  wireExportButtons();
}
