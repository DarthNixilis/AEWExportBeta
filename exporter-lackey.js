// exporter-lackey.js
// AEW TCG – LackeyCCG Exporter
// ES MODULE FILE: imported via exporter.js barrel.
// IMPORTANT: No side effects at load time. Nothing should run until a function is called.

/* ----------------------------- Utilities ----------------------------- */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Try multiple possible global state keys so this exporter can survive refactors.
 * Edit this list if your app uses different names.
 */
function getDeckFromGlobals() {
  const deck =
    window.currentDeck ??
    window.deck ??
    window.selectedDeck ??
    window.deckList ??
    window.activeDeck;

  assert(
    deck,
    "No deck found. Expected one of: window.currentDeck, window.deck, window.selectedDeck, window.deckList, window.activeDeck."
  );
  assert(Array.isArray(deck), "Deck is not an array (export expects an array).");

  return deck;
}

/**
 * Quantity field varies a lot across apps. Support a few common names.
 */
function getQty(card) {
  const qty = card?.qty ?? card?.count ?? card?.quantity ?? 1;
  const n = Number(qty);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Name field varies too.
 */
function getName(card) {
  return card?.name ?? card?.cardName ?? card?.title ?? "";
}

/**
 * Optional metadata fields (safe defaults).
 */
function getSet(card) {
  return card?.set ?? card?.setName ?? card?.expansion ?? "AEW";
}

function getId(card) {
  return card?.id ?? card?.cardId ?? card?.uuid ?? "";
}

/**
 * Convert a single card to a Lackey-ish line.
 * If you have a strict Lackey format you want, this is the ONE place to change it.
 *
 * Current format:
 *   qty|name|set|id
 */
function formatCardForLackey(card) {
  assert(card, "Encountered an undefined card while exporting.");

  const name = getName(card);
  assert(name, "Card missing name/title field.");

  const qty = getQty(card);
  const set = getSet(card);
  const id = getId(card);

  return `${qty}|${name}|${set}|${id}`;
}

/* ----------------------------- Exports ----------------------------- */

/**
 * Primary export function (new name).
 * Returns a text block.
 */
export function exportForLackey() {
  const deck = getDeckFromGlobals();

  const lines = [];
  lines.push("// AEW TCG – Lackey Export");
  lines.push(`// Generated: ${new Date().toISOString()}`);
  lines.push("");

  for (const card of deck) {
    lines.push(formatCardForLackey(card));
  }

  // If deck is empty, still return a file with header (useful debugging)
  if (deck.length === 0) {
    lines.push("// (Deck is empty)");
  }

  return lines.join("\n");
}

/**
 * Legacy name expected by listeners.js.
 * Keep this forever so UI code doesn't explode when exporter internals change.
 */
export const generateLackeyCCGDeck = exportForLackey;
