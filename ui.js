// ui.js
// Central UI wiring + state reflection
// ES module, no side effects until DOM is ready

function showUIError(title, message, extra = null) {
  window.AEWError?.show(title, message, "error", extra);
}

function byId(id) {
  return document.getElementById(id);
}

function qs(root, selector, label) {
  const el = root.querySelector(selector);
  if (!el) {
    showUIError(
      "UI Init Error",
      `Missing expected UI element (${label}): ${selector}`
    );
  }
  return el;
}

function initUI() {
  // ---- ROOT CONTAINER ----
  // Change this ID ONLY if your HTML actually uses something else.
  const appRoot =
    byId("app") ||
    byId("root") ||
    document.body;

  if (!appRoot) {
    showUIError(
      "UI Init Error",
      "No valid UI root found (expected #app, #root, or <body>)."
    );
    return;
  }

  // ---- OPTIONAL PANELS / SECTIONS ----
  // These are optional; missing ones will not crash the app.

  const deckPanel = qs(appRoot, "#deckPanel", "Deck Panel");
  const cardPoolPanel = qs(appRoot, "#cardPoolPanel", "Card Pool Panel");
  const personaPanel = qs(appRoot, "#personaPanel", "Persona Panel");

  // ---- BUTTONS (OPTIONAL, SAFE) ----
  const btnExportPlainText = qs(appRoot, "#btnExportPlainText", "Plain Text Export Button");
  const btnExportLackey = qs(appRoot, "#btnExportLackey", "Lackey Export Button");
  const btnExportImage = qs(appRoot, "#btnExportImage", "Image Export Button");

  // We do NOT wire exporters here.
  // listeners.js owns exporter wiring to avoid circular dependencies.

  // ---- UI STATE REFRESH HELPERS ----

  function refreshDeckCount() {
    const deck = window.currentDeck;
    if (!Array.isArray(deck)) return;

    const countEl = qs(appRoot, "#deckCount", "Deck Count");
    if (!countEl) return;

    countEl.textContent = String(deck.length);
  }

  function refreshPersona() {
    const persona = window.currentPersona;
    if (!persona) return;

    const personaNameEl = qs(appRoot, "#personaName", "Persona Name");
    if (personaNameEl) {
      personaNameEl.textContent = persona.name || "(Unnamed Persona)";
    }
  }

  // ---- INITIAL REFRESH ----
  refreshDeckCount();
  refreshPersona();

  // ---- GLOBAL EVENTS (OPTIONAL) ----
  // These allow other modules to request UI updates without tight coupling.

  window.addEventListener("aew:deckChanged", refreshDeckCount);
  window.addEventListener("aew:personaChanged", refreshPersona);
}

/* ----------------------------- Boot ----------------------------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
