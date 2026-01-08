// exporter-text.js
// AEW TCG – Plain Text Exporter (ES module)
// No side effects at load time.

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

function getQty(card) {
  const qty = card?.qty ?? card?.count ?? card?.quantity ?? 1;
  const n = Number(qty);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function getName(card) {
  return card?.name ?? card?.cardName ?? card?.title ?? "(Unnamed)";
}

/**
 * New name (internal-friendly): exportDeckAsText
 * Returns lines like: "3x Jon Moxley"
 */
export function exportDeckAsText() {
  const deck = getDeckFromGlobals();

  const lines = [];
  for (const card of deck) {
    const qty = getQty(card);
    const name = getName(card);
    lines.push(`${qty}x ${name}`);
  }

  if (deck.length === 0) lines.push("(Deck is empty)");

  return lines.join("\n");
}

/**
 * Legacy name expected by listeners.js.
 * Keep this forever.
 */
export const generatePlainTextDeck = exportDeckAsText;
