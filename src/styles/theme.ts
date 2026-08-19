/**
 * Design tokens. The palette came out of the concept phase and is deliberate:
 * a deep, warm-dark ground so the lanes can glow against it.
 */

export const COLORS = {
  base: '#14121c',
  raised: '#1a1725',
  text: '#ede7f6',
  muted: '#8d84a6',
  /**
   * Reserved for Runs — the merge accent, and nothing else.
   *
   * Lighter than the gold the concept called for (`#f2c879`), because that
   * gold and the amber branch colour are the same hue family and were being
   * mistaken for each other on the canvas. Pulling the accent up in lightness
   * and down in saturation keeps it warm while making it read as *light* over
   * the lanes rather than as one more coloured thread.
   *
   * The alternative was to keep the gold and replace amber in the branch
   * palette; that was rejected because it would have taken a colour away from
   * a person rather than from the accent.
   */
  accent: '#f7e3bd',
} as const

/**
 * Seven branch colours for seven Regulars, one each, assigned by lane order.
 * Guests deliberately get none of these — see docs/SCOPE.md.
 */
export const BRANCH_PALETTE = [
  '#e8a33d', // amber
  '#4fc1b0', // teal
  '#e8615d', // coral
  '#9b7ede', // violet
  '#8fbc8b', // sage
  '#5ec8e8', // sky
  '#e88fc2', // pink
] as const

/** One muted treatment shared by every Guest, so a single appearance never
 *  competes with an eleven-year thread. */
export const GUEST_COLOR = '#6f6885'

export const FONTS = {
  display: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const
