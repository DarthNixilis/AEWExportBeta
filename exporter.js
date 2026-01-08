// exporter.js
// AEW TCG – LackeyCCG Exporter
// This file MUST have no side effects at load time.
// Nothing runs unless exportForLackey() is called.

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Safely get card pool / deck data from global app state.
 * Adjust these accessors if your main app changes structure.
 */
function getAppState() {
  const state = {
    // change these keys if your app uses different globals
    cardPool: window.cardPool,
    deck: window.currentDeck,
    persona: window.currentPersona,
  };

  assert(state.deck, "No deck found (window.currentDeck is undefined).");
  assert(
    Array.isArray(state.deck),
    "Deck is not an array. Export expects an array of cards."
  );

  return state;
}

/**
 * Convert a single card to Lackey format.
 * Modify this to match your exact Lackey export spec.
 */
function formatCardForLackey(card) {
  assert(card, "Encountered undefined card during export.");
  assert(card.name, "Card missing name field.");

  const qty = card.qty ?? 1;
  const name = card.name;
  const set = card.set ?? "AEW";
  const id = card.id ?? "";

  // Basic Lackey-style line
  // Example: 3|Jon Moxley|AEW|123
  return `${qty}|${name}|${set}|${id}`;
}

/**
 * Main export function
 * Called by the TEST EXPORT button
 */
export function exportForLackey() {
  const { deck, persona } = getAppState();

  const lines = [];

  // Header (commented so Lackey ignores it)
  lines.push("// AEW TCG – Lackey Export");
  lines.push(`// Generated: ${new Date().toISOString()}`);

  if (persona?.name) {
    lines.push(`// Persona: ${persona.name}`);
  }

  lines.push(""); // spacer

  // Cards
  for (const card of deck) {
    lines.push(formatCardForLackey(card));
  }

  assert(lines.length > 0, "Export produced no output.");

  return lines.join("\n");
}
