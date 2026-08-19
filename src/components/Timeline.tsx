import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MEMBERS_BY_ID } from '../data/members'
import type { MemberId } from '../data/types'
import { buildTimeline } from '../timeline/build'
import { placeCards, STRIP_HEIGHT } from '../timeline/cards'
import { FIRST_YEAR, timelineHeight, yearToPx } from '../timeline/layout'
import { MemberHeader } from './MemberHeader'
import { RunCard } from './RunCard'
import { TimelineCanvas } from './TimelineCanvas'

const YEAR_GUTTER = 56
const COLUMN_GAP = 20
const MIN_CANVAS = 300
const MAX_CANVAS = 620

/**
 * Two layouts, plus a narrow variant of the second.
 *
 * `split` is the real thing: canvas centred, cards down both sides. It needs
 * room for two readable strips, and below roughly 980px they degrade into
 * unreadable slivers — so narrower screens stack instead, with the canvas on
 * the left and one column of full-width cards beside it. The phone rail is the
 * same stacked layout with the canvas squeezed to a texture (docs/SCOPE.md).
 */
const SPLIT_BREAKPOINT = 980
const RAIL_BREAKPOINT = 640
const RAIL_WIDTH = 110

type Props = { width: number }

export function Timeline({ width }: Props) {
  const split = width >= SPLIT_BREAKPOINT
  const rail = width < RAIL_BREAKPOINT

  const canvasWidth = rail
    ? RAIL_WIDTH
    : split
      ? Math.max(MIN_CANVAS, Math.min(MAX_CANVAS, width * 0.42))
      : Math.max(240, Math.min(400, width * 0.34))

  const model = useMemo(
    // The wobble comes down with the lanes: at rail width the amplitude would
    // make them cross (docs/SCOPE.md).
    () => buildTimeline({ width: canvasWidth, wobbleScale: rail ? 0 : 1 }),
    [canvasWidth, rail],
  )

  const height = timelineHeight(model.lastYear)

  const cards = useMemo(
    () =>
      placeCards(
        // Evergreens get a card too. They have no spine on the canvas, but the
        // longest-running thing the group ever played still needs somewhere to
        // be read about.
        model.runs
          .filter((placed) => placed.spine || placed.wash)
          .map((placed) => ({
            id: placed.run.id,
            anchorY: yearToPx(placed.span.from),
            spineX:
              placed.spine?.x ??
              (placed.wash!.fromX + placed.wash!.toX) / 2,
          })),
        canvasWidth,
        split ? 2 : 1,
      ),
    [model, canvasWidth, split],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedRunId, setFocusedRunId] = useState<string | null>(null)
  const [hoveredRunId, setHoveredRunId] = useState<string | null>(null)
  const [pinnedMemberId, setPinnedMemberId] = useState<MemberId | null>(null)
  const [viewportYear, setViewportYear] = useState(FIRST_YEAR)

  // The Run nearest the middle of the viewport is the one in focus. Tracked on
  // every frame the user scrolls, never on a timer, so it never lags them.
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const container = containerRef.current
      if (!container) return

      const box = container.getBoundingClientRect()
      const middle = window.innerHeight / 2 - box.top

      let nearest: string | null = null
      let nearestDistance = Infinity
      for (const card of cards) {
        const distance = Math.abs(card.anchorY - middle)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearest = card.id
        }
      }

      setFocusedRunId(nearestDistance < window.innerHeight / 2 ? nearest : null)
      setViewportYear(FIRST_YEAR + Math.max(0, middle) / 460)
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [cards])

  // Two different things, deliberately kept apart.
  //
  // Expansion follows the scroll: whatever you have scrolled to opens up, so
  // reading the page never requires aiming at anything.
  //
  // Dimming follows intent: only hovering a card or pinning a Member pushes
  // everything else back. Dimming on mere scroll position would leave most of
  // the page greyed out at all times, which reads as broken rather than
  // focused.
  const expandedRunId = hoveredRunId ?? focusedRunId
  const intentRunId = hoveredRunId

  // Highlighting is what disambiguates overlapping Runs, so it is not
  // decoration — see ADR-0005. A pinned Member wins over a hovered Run.
  const litMembers = useMemo(() => {
    if (pinnedMemberId) return new Set<MemberId>([pinnedMemberId])
    if (!intentRunId) return null
    const run = model.runs.find((placed) => placed.run.id === intentRunId)
    return run ? new Set<MemberId>(run.run.members) : null
  }, [pinnedMemberId, intentRunId, model])

  const litRuns = useMemo(() => {
    if (!pinnedMemberId) return intentRunId ? new Set([intentRunId]) : null
    return new Set(
      model.runs
        .filter((placed) => placed.run.members.includes(pinnedMemberId))
        .map((placed) => placed.run.id),
    )
  }, [pinnedMemberId, intentRunId, model])

  const colorOf = (id: string) =>
    model.members.find((placed) => placed.member.id === id)?.color ?? '#fff'

  const activeMembers = useMemo(
    () =>
      model.members
        .filter(
          (placed) =>
            placed.span.from <= viewportYear && viewportYear <= placed.span.to,
        )
        .map((placed) => placed.member.id),
    [model, viewportYear],
  )

  // An expanded card lifts above its neighbours instead of pushing them, which
  // is what keeps the layout from jumping — but it half-covers the strips
  // underneath, leaving headless fragments poking out. So the strips it covers
  // are hidden outright. Their height has to be measured, because it depends on
  // how much description a Run has.
  const expandedRef = useRef<HTMLDivElement>(null)
  const [expandedHeight, setExpandedHeight] = useState(0)

  useLayoutEffect(() => {
    // scrollHeight, not offsetHeight: the box is mid-animation on open, but its
    // content height is already final.
    setExpandedHeight(expandedRef.current?.scrollHeight ?? 0)
  }, [expandedRunId])

  const coveredCardIds = useMemo(() => {
    const expanded = cards.find((card) => card.id === expandedRunId)
    if (!expanded || expandedHeight === 0) return new Set<string>()

    const bottom = expanded.y + expandedHeight
    return new Set(
      cards
        .filter(
          (card) =>
            card.id !== expanded.id &&
            card.side === expanded.side &&
            card.y < bottom &&
            card.y + STRIP_HEIGHT > expanded.y,
        )
        .map((card) => card.id),
    )
  }, [cards, expandedRunId, expandedHeight])

  const cardWidth = split
    ? (width - canvasWidth - YEAR_GUTTER - COLUMN_GAP * 2) / 2
    : width - YEAR_GUTTER - canvasWidth - COLUMN_GAP * 2

  return (
    <>
      <MemberHeader
        activeMembers={activeMembers}
        pinnedMemberId={pinnedMemberId}
        colorOf={colorOf}
        onPin={(id) => setPinnedMemberId((current) => (current === id ? null : id))}
      />

      <div
        className={`timeline${split ? '' : ' timeline--stacked'}`}
        style={{ height }}
        ref={containerRef}
      >
        <div className="timeline__years" style={{ width: YEAR_GUTTER }}>
          {Array.from(
            { length: model.lastYear - FIRST_YEAR + 1 },
            (_, index) => FIRST_YEAR + index,
          ).map((year) => (
            <span
              key={year}
              className="timeline__year"
              style={{ top: yearToPx(year) }}
            >
              {year}
            </span>
          ))}
        </div>

        {/* Eras belong to the whole page width, not to the canvas: they are
            context for everything at that height, cards included. */}
        {model.eras.map((era, index) => (
          <div
            key={era.id}
            className={`timeline__era-band timeline__era-band--${index % 2 === 0 ? 'light' : 'dark'}`}
            style={{
              top: yearToPx(era.from),
              height: yearToPx(era.to) - yearToPx(era.from),
            }}
          >
            <span className="timeline__era">{era.label}</span>
          </div>
        ))}

        <div
          className="timeline__canvas"
          style={{
            width: canvasWidth,
            left: split ? undefined : YEAR_GUTTER,
          }}
        >
          <TimelineCanvas
            model={model}
            litMembers={litMembers}
            litRuns={litRuns}
          />
        </div>

        {cards.map((card) => {
          const placed = model.runs.find((run) => run.run.id === card.id)!
          return (
            <div
              key={card.id}
              ref={card.id === expandedRunId ? expandedRef : undefined}
              className={`timeline__card timeline__card--${split ? card.side : 'stacked'}${
                coveredCardIds.has(card.id) ? ' timeline__card--covered' : ''
              }`}
              style={{ top: card.y, width: cardWidth, minHeight: STRIP_HEIGHT }}
            >
              <RunCard
                run={placed.run}
                expanded={expandedRunId === card.id}
                dimmed={litRuns !== null && !litRuns.has(card.id)}
                colorOf={colorOf}
                onFocus={() => setHoveredRunId(card.id)}
                onBlur={() => setHoveredRunId(null)}
              />
            </div>
          )
        })}
      </div>

      <footer className="closing">
        <p className="closing__line">és megy tovább</p>
        <p className="closing__meta">
          {MEMBERS_BY_ID.size} ember, {model.runs.length} közös szakasz, 2014 óta
        </p>
      </footer>
    </>
  )
}
