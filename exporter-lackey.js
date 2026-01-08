// exporter-lackey.js
// No side effects at load. Only runs when exportForLackey() is called.

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getDeck() {
  // Adjust this to match your app's actual deck global.
  const deck = window.currentDeck ?? window.deck ?? window.selectedDeck;
  assert(deck, "No deck found (expected window.currentDeck / window.deck / window.selectedDeck).");
  assert(Array.isArray(deck), "Deck is not an array.");
  return deck;
}

function formatCardForLackey(card) {
  assert(card, "Undefined card in deck.");
  const qty = card.qty ?? card.count ?? 1;
  const name = card.name ?? card.cardName;
  assert(name, "Card missing name.");

  const set = card.set ?? card.setName ?? "AEW";
  const id = card.id ?? card.cardId ?? "";

  // Change this line format to match your Lackey expectations.
  return `${qty}|${name}|${set}|${id}`;
}

export function exportForLackey() {
  const deck = getDeck();

  const lines = [];
  lines.push("// AEW TCG – Lackey Export");
  lines.push(`// Generated: ${new Date().toISOString()}`);
  lines.push("");

  for (const card of deck) lines.push(formatCardForLackey(card));

  return lines.join("\n");
}
