// exporter-text.js

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
  assert(Array.isArray(deck), "Deck is not an array.");
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

export function exportDeckAsText() {
  const deck = getDeckFromGlobals();
  const lines = deck.map((c) => `${getQty(c)}x ${getName(c)}`);
  return (lines.length ? lines : ["(Deck is empty)"]).join("\n");
}

// Legacy name expected by listeners.js
export const generatePlainTextDeck = exportDeckAsText;
