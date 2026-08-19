import { motion, useReducedMotion } from 'framer-motion'
import { GAMES_BY_ID } from '../data/games'
import { MEMBERS_BY_ID } from '../data/members'
import type { Run } from '../data/types'
import { formatEnding, formatNames, formatSpan } from '../timeline/format'

type Props = {
  run: Run
  expanded: boolean
  dimmed: boolean
  colorOf: (id: string) => string
  onFocus: () => void
  onBlur: () => void
}

/**
 * A Run, collapsed to a strip until it comes into focus.
 *
 * The strip is the point: a Run with no description and year-only precision
 * looks finished as a strip rather than truncated, which is what lets the site
 * hold sparse data without looking broken (docs/SCOPE.md).
 *
 * Collapsed, participants are colour dots only — no names. That keeps the strip
 * to one predictable height whatever the size of the group, which is what stops
 * neighbouring strips from colliding.
 */
export function RunCard({
  run,
  expanded,
  dimmed,
  colorOf,
  onFocus,
  onBlur,
}: Props) {
  // CSS cannot reach these: framer-motion drives them in JS, so the
  // media-query override in index.css leaves them at full strength.
  const reduceMotion = useReducedMotion()

  const game = GAMES_BY_ID.get(run.game)
  const members = run.members
    .map((id) => MEMBERS_BY_ID.get(id))
    .filter((member) => member !== undefined)

  return (
    <motion.article
      className={`card${expanded ? ' card--expanded' : ''}${dimmed ? ' card--dimmed' : ''}`}
      // Feedback belongs on approach and on the press, not on release.
      onHoverStart={onFocus}
      onHoverEnd={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={0}
      // Critically damped: this is not a momentum gesture, so it should settle
      // without overshoot.
      layout={reduceMotion ? false : true}
      transition={
        reduceMotion
          ? { duration: 0.12 }
          : { type: 'spring', bounce: 0, duration: 0.34 }
      }
    >
      <header className="card__head">
        <h3 className="card__title">{game?.title ?? run.game}</h3>
        <p className="card__span">{formatSpan(run.from, run.ending)}</p>
      </header>

      {expanded ? (
        <ul className="card__members" aria-label="Résztvevők">
          {members.map((member) => (
            <li key={member.id} className="card__member">
              <span
                className="card__dot"
                style={{ background: colorOf(member.id) }}
                aria-hidden
              />
              {member.name}
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="card__dots"
          aria-label={formatNames(members.map((member) => member.name))}
        >
          {members.map((member) => (
            <span
              key={member.id}
              className="card__dot"
              style={{ background: colorOf(member.id) }}
              aria-hidden
            />
          ))}
        </p>
      )}

      {expanded && (
        <motion.div
          className="card__body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
        >
          <p className="card__meta">
            {formatEnding(run.ending)}
            {run.evergreen && ' · végig velünk volt'}
          </p>

          {run.description ? (
            <p className="card__description">{run.description}</p>
          ) : (
            <p className="card__empty">
              Erről még nincs leírás — {formatNames(members.map((m) => m.name))}{' '}
              emlékei kellenek hozzá.
            </p>
          )}

          {run.moments && run.moments.length > 0 && (
            <ul className="card__moments">
              {run.moments.map((moment, index) => (
                <li key={index}>{moment.text}</li>
              ))}
            </ul>
          )}

          {run.unverified && (
            <p className="card__unverified">Az időpont még nincs ellenőrizve</p>
          )}
        </motion.div>
      )}
    </motion.article>
  )
}
