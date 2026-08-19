import { GAMES_BY_ID } from '../data/games'
import type { MemberId } from '../data/types'
import { COLORS } from '../styles/theme'
import type { TimelineModel } from '../timeline/build'
import { FIRST_YEAR, timelineHeight, yearToPx } from '../timeline/layout'

type Props = {
  model: TimelineModel
  /** Members to keep lit. Null means everything is lit. */
  litMembers: Set<MemberId> | null
  /** Runs to keep lit. Null means everything is lit. */
  litRuns: Set<string> | null
}

/** How far anything unrelated recedes when something is highlighted. */
const DIMMED = 0.14

export function TimelineCanvas({ model, litMembers, litRuns }: Props) {
  const { width } = model
  const height = timelineHeight(model.lastYear)
  const years = Array.from(
    { length: model.lastYear - FIRST_YEAR + 1 },
    (_, index) => FIRST_YEAR + index,
  )

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="A társaság közös játékainak idővonala 2014-től napjainkig"
    >
      <defs>
        {/* One gradient per lane: same colour throughout, opacity following
            activity, so a lane brightens and dims without a seam. */}
        {model.members.map(({ member, color, lane }) => (
          <linearGradient
            key={member.id}
            id={`lane-${member.id}`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={lane.top}
            x2={0}
            y2={lane.bottom}
          >
            {lane.stops.map((stop, index) => (
              <stop
                key={index}
                offset={stop.offset}
                stopColor={color}
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
        ))}

        {/* An Evergreen's wash fades out at both edges, so it reads as a
            presence underneath the lanes rather than as a drawn rectangle. */}
        {model.runs.map(({ run, wash }) =>
          wash ? (
            <linearGradient key={`wash-${run.id}`} id={`wash-${run.id}`}>
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0} />
              <stop offset="50%" stopColor={COLORS.accent} stopOpacity={0.1} />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
            </linearGradient>
          ) : null,
        )}

        {/* A faded Run has no end, so its spine trails off instead of stopping.
            These must be in user space: a vertical line has a zero-width
            bounding box, and SVG does not render an objectBoundingBox gradient
            on a zero-width box at all — which made every spine invisible. */}
        {model.runs.map(({ run, spine, span }) =>
          spine && run.ending.kind === 'faded' ? (
            <linearGradient
              key={run.id}
              id={`fade-${run.id}`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={yearToPx(span.from)}
              x2={0}
              y2={yearToPx(span.to)}
            >
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.72} />
              <stop offset="55%" stopColor={COLORS.accent} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
            </linearGradient>
          ) : null,
        )}
      </defs>

      {/* Era bands are not drawn here. They belong to the whole timeline, not
          to the canvas, so they are full-width HTML behind everything — see
          Timeline.tsx. Drawing them inside the SVG left a visible rectangle
          edge where the canvas ended. */}

      {/* Year rules, faint enough to give rhythm without becoming a grid. */}
      {years.map((year) => (
        <line
          key={year}
          x1={0}
          x2={width}
          y1={yearToPx(year)}
          y2={yearToPx(year)}
          stroke={COLORS.muted}
          strokeOpacity={0.07}
        />
      ))}

      {/* Evergreens: a wash behind everything, no spine and no tie. An
          Evergreen runs for years with everyone, so giving it a Run body would
          leave the canvas permanently tied together and say nothing (ADR-0005).
          It still has to be *here*, though — League of Legends is the longest
          thread the group has. */}
      {model.runs.map(({ run, wash, span }) =>
        wash ? (
          <rect
            key={run.id}
            className="run"
            x={wash.fromX}
            y={yearToPx(span.from)}
            width={Math.max(wash.toX - wash.fromX, 1)}
            height={yearToPx(span.to) - yearToPx(span.from)}
            fill={`url(#wash-${run.id})`}
            opacity={litRuns && !litRuns.has(run.id) ? DIMMED : 1}
          />
        ) : null,
      )}

      {/* Lanes sit under the Run bodies, so the spines read as being in front. */}
      {model.members.map(({ member, lane }) => (
        <path
          key={member.id}
          className="lane"
          d={lane.d}
          fill={`url(#lane-${member.id})`}
          opacity={litMembers && !litMembers.has(member.id) ? DIMMED : 1}
        />
      ))}

      {/* Runs: a tie announcing who, and a spine showing how long. */}
      {model.runs.map(({ run, spine, tie, span }) => {
        if (!spine || !tie) return null

        const top = yearToPx(span.from)
        const bottom = yearToPx(span.to)
        const faded = run.ending.kind === 'faded'

        return (
          <g
            key={run.id}
            className="run"
            opacity={litRuns && !litRuns.has(run.id) ? DIMMED : 1}
          >
            {/* The bar reaches across the group; the nodes say who is in it.
                Only participants get a node, so a lane the bar merely passes
                over is visibly not part of the Run. */}
            <line
              x1={tie.fromX}
              x2={tie.toX}
              y1={top}
              y2={top}
              stroke={COLORS.accent}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
            {tie.nodes.map((x, index) => (
              <circle
                key={index}
                cx={x}
                cy={top}
                r={2.4}
                fill={COLORS.accent}
                fillOpacity={0.85}
              />
            ))}
            <line
              x1={spine.x}
              x2={spine.x}
              y1={top}
              y2={bottom}
              stroke={faded ? `url(#fade-${run.id})` : COLORS.accent}
              strokeOpacity={faded ? 1 : 0.68}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            {run.ending.kind === 'closed' && (
              <line
                x1={spine.x - 4}
                x2={spine.x + 4}
                y1={bottom}
                y2={bottom}
                stroke={COLORS.accent}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
            <title>
              {GAMES_BY_ID.get(run.game)?.title} — {run.members.length} fő
            </title>
          </g>
        )
      })}
    </svg>
  )
}
