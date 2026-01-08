// exporter-text.js
// Simple deck-to-text exporter, safe default.

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getDeck() {
  const deck = window.currentDeck ?? window.deck ?? window.selectedDeck;
  assert(deck, "No deck found (expected window.currentDeck / window.deck / window.selectedDeck).");
  assert(Array.isArray(deck), "Deck is not an array.");
  return deck;
}

export function exportDeckAsText() {
  const deck = getDeck();

  // Outputs "3x Card Name" lines
  const lines = deck.map((c) => {
    const qty = c.qty ?? c.count ?? 1;
    const name = c.name ?? c.cardName ?? "(Unnamed)";
    return `${qty}x ${name}`;
  });

  return lines.join("\n");
}
