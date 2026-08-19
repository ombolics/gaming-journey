/**
 * The coordinate system: decimal years down, lanes across.
 *
 * Pure functions of their arguments. Nothing here touches the DOM, React, or
 * the data modules — it takes plain numbers and ids and returns geometry.
 */

import type { MemberId } from '../data/types'

/** Vertical scale. Generous, because the whole point is to scroll through it. */
export const PX_PER_YEAR = 460
export const PAD_TOP = 80
export const PAD_BOTTOM = 160

export const FIRST_YEAR = 2014

export function timelineHeight(lastYear: number): number {
  return (lastYear - FIRST_YEAR) * PX_PER_YEAR + PAD_TOP + PAD_BOTTOM
}

export function yearToPx(year: number): number {
  return PAD_TOP + (year - FIRST_YEAR) * PX_PER_YEAR
}

export function pxToYear(px: number): number {
  return FIRST_YEAR + (px - PAD_TOP) / PX_PER_YEAR
}

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

/**
 * The canvas is split into the Regulars' lanes and a narrower guest zone on the
 * right. Regulars keep their x for life — positional constancy is the memory
 * aid that lets you read the canvas without labels (see docs/SCOPE.md).
 */
export type LaneGeometry = {
  width: number
  /** x of each Regular lane, in lane order. */
  regularX: number[]
  /** x of each recyclable guest slot. */
  guestX: number[]
}

const GUEST_ZONE_FRACTION = 0.16
const EDGE_INSET = 0.06

export function laneGeometry(
  width: number,
  regularCount: number,
  guestSlots: number,
): LaneGeometry {
  const inset = width * EDGE_INSET
  const guestZone = width * GUEST_ZONE_FRACTION
  const regularSpan = width - inset * 2 - guestZone

  // Regulars are evenly spread across their span. With one Regular, centre it.
  const step = regularCount > 1 ? regularSpan / (regularCount - 1) : 0
  const regularX = Array.from({ length: regularCount }, (_, i) =>
    regularCount > 1 ? inset + i * step : inset + regularSpan / 2,
  )

  const guestStep = guestSlots > 0 ? guestZone / guestSlots : 0
  const guestX = Array.from(
    { length: guestSlots },
    (_, i) => width - inset - guestZone + guestStep * (i + 0.5),
  )

  return { width, regularX, guestX }
}

// ---------------------------------------------------------------------------
// Guest slot allocation
// ---------------------------------------------------------------------------

export type Interval = { from: number; to: number }

/**
 * Guests share a small pool of x positions, recycled over time. A slot is free
 * for a Guest if no other Guest already in it overlaps them in time.
 *
 * Guests have nothing to memorise — they appear once — so reusing their
 * position costs the reader nothing, while giving the Regulars room.
 */
export function allocateGuestSlots(
  guests: { id: MemberId; span: Interval }[],
): { slots: Map<MemberId, number>; slotCount: number } {
  const ordered = [...guests].sort((a, b) => a.span.from - b.span.from)
  const occupied: Interval[][] = []
  const slots = new Map<MemberId, number>()

  for (const guest of ordered) {
    let slot = occupied.findIndex(
      (taken) => !taken.some((t) => overlaps(t, guest.span)),
    )
    if (slot === -1) {
      slot = occupied.length
      occupied.push([])
    }
    occupied[slot].push(guest.span)
    slots.set(guest.id, slot)
  }

  return { slots, slotCount: Math.max(occupied.length, 1) }
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.from < b.to && b.from < a.to
}
