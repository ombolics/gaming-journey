/**
 * Where each Run's card goes.
 *
 * Cards are auto-packed rather than strictly alternating: each one goes to
 * whichever column is currently less full, with the side its spine sits on used
 * only to break ties. Runs overlap in time, so collisions are the normal case
 * rather than an exception (docs/SCOPE.md) — the collapsed strip is small
 * enough that they still fit.
 *
 * Placement is absolute, which is what keeps expansion free of layout jumps:
 * an expanding card grows over its neighbours instead of pushing them.
 */

export type CardInput = {
  id: string
  /** Where the Run actually starts on the axis, in px. */
  anchorY: number
  /** Where its spine sits horizontally, in px. */
  spineX: number
}

export type PlacedCard = {
  id: string
  side: 'left' | 'right'
  /** Where the card is drawn. Equal to anchorY unless it had to give way. */
  y: number
  anchorY: number
  spineX: number
}

/**
 * Height of a collapsed strip, in px. This has to match what the card actually
 * renders as, or strips overlap: title row, dot row, and the padding around
 * them. It is a constant rather than a measurement because placement runs
 * before layout — which is also why the collapsed card shows dots instead of
 * names, so its height cannot depend on the size of the group.
 */
export const STRIP_HEIGHT = 64

/** Breathing room between two strips on the same side. */
export const STRIP_GAP = 12

/**
 * @param columns How many columns the cards will actually be rendered into.
 *   Two on the split layout, one when stacked. It has to be told, because
 *   packing for two tracks and then rendering them into one puts strips on top
 *   of each other.
 */
export function placeCards(
  cards: CardInput[],
  canvasWidth: number,
  columns: 1 | 2,
): PlacedCard[] {
  const ordered = [...cards].sort((a, b) => a.anchorY - b.anchorY)
  const middle = canvasWidth / 2

  // The lowest point currently occupied on each side.
  const occupiedTo: Record<'left' | 'right', number> = {
    left: -Infinity,
    right: -Infinity,
  }

  return ordered.map((card) => {
    if (columns === 1) {
      const y = Math.max(card.anchorY, occupiedTo.right)
      occupiedTo.right = y + STRIP_HEIGHT + STRIP_GAP
      return { id: card.id, side: 'right', y, anchorY: card.anchorY, spineX: card.spineX }
    }

    const preferred: 'left' | 'right' = card.spineX < middle ? 'left' : 'right'

    // Balance first, spine side only as a tie-break.
    //
    // Choosing the spine's own side first sounds better than it is: most Runs
    // involve the people in the leftmost lanes, so almost every centroid lands
    // left of the middle, and the right column ends up empty. The tie and its
    // nodes are what say who is in a Run, so the side a card sits on carries
    // little meaning — and an evenly filled page is worth more than a weak
    // spatial hint.
    const side =
      occupiedTo.left === occupiedTo.right
        ? preferred
        : occupiedTo.left < occupiedTo.right
          ? 'left'
          : 'right'

    const y = Math.max(card.anchorY, occupiedTo[side])
    occupiedTo[side] = y + STRIP_HEIGHT + STRIP_GAP

    return { id: card.id, side, y, anchorY: card.anchorY, spineX: card.spineX }
  })
}
