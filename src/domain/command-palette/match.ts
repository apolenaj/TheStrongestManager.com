import { COMMAND_PALETTE_ACTIONS } from "@/domain/command-palette/catalog";
import type {
  CommandPaletteAction,
  CommandPaletteMatch,
} from "@/domain/command-palette/types";

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Simple deterministic score: higher is better.
 * Empty query → all commands with equal base score (catalog order preserved via stable sort).
 */
export function scoreCommand(
  command: CommandPaletteAction,
  query: string,
): number {
  const q = normalize(query);
  if (!q) return 1;

  const label = normalize(command.label);
  const desc = normalize(command.description);
  const hay = [label, desc, ...command.keywords.map(normalize)].join(" ");

  if (label === q) return 1000;
  if (label.startsWith(q)) return 800;
  if (label.includes(q)) return 600;

  const tokens = q.split(" ").filter(Boolean);
  let tokenHits = 0;
  for (const t of tokens) {
    if (hay.includes(t)) tokenHits += 1;
  }
  if (tokenHits === tokens.length && tokens.length > 0) {
    return 400 + tokenHits * 10;
  }
  if (tokenHits > 0) return 200 + tokenHits * 10;

  // Subsequence soft match on label
  let li = 0;
  for (let i = 0; i < label.length && li < q.length; i++) {
    if (label[i] === q[li]) li += 1;
  }
  if (li === q.length) return 100;

  return 0;
}

export function filterCommands(
  query: string,
  actions: readonly CommandPaletteAction[] = COMMAND_PALETTE_ACTIONS,
): CommandPaletteMatch[] {
  const scored = actions
    .map((command) => ({ command, score: scoreCommand(command, query) }))
    .filter((m) => m.score > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.command.label.localeCompare(b.command.label);
  });

  return scored;
}
