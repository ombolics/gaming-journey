import { useEffect, useState } from 'react'

/** Matches `.canvas` in index.css. Kept here so the geometry never has to
 *  measure the DOM to find out how wide it is allowed to be. */
export const CANVAS_MAX_WIDTH = 1440
export const CANVAS_PADDING = 24

/**
 * The width the timeline should draw itself at.
 *
 * Derived from the viewport rather than measured off an element: measuring
 * depends on styles having landed and on ResizeObserver firing, and both of
 * those have already bitten us once. This is deterministic and needs no
 * layout pass.
 */
export function useCanvasWidth(): number {
  const [viewport, setViewport] = useState(() =>
    typeof window === 'undefined' ? CANVAS_MAX_WIDTH : window.innerWidth,
  )

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth)
    window.addEventListener('resize', onResize)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return Math.max(
    280,
    Math.min(viewport, CANVAS_MAX_WIDTH) - CANVAS_PADDING * 2,
  )
}
