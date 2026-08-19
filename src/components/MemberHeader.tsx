import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MEMBERS_BY_ID } from '../data/members'
import type { MemberId } from '../data/types'

type Props = {
  activeMembers: MemberId[]
  pinnedMemberId: MemberId | null
  colorOf: (id: string) => string
  onPin: (id: MemberId) => void
}

/**
 * Who was around at the height you are currently reading.
 *
 * Only the Members alive at this point in the timeline appear, which is what
 * keeps fourteen names from crowding the bar at once. Clicking one pins the
 * highlight to them.
 *
 * The bar is a translucent layer with the canvas passing underneath rather than
 * an opaque strip, so it never feels like it has taken a bite out of the page.
 */
export function MemberHeader({
  activeMembers,
  pinnedMemberId,
  colorOf,
  onPin,
}: Props) {
  // Reduced motion means a gentler equivalent, not none: the chips still come
  // and go, they just cross-fade instead of springing in.
  const reduceMotion = useReducedMotion()

  return (
    <div className="member-header">
      <AnimatePresence initial={false} mode="popLayout">
        {activeMembers.map((id) => {
          const member = MEMBERS_BY_ID.get(id)
          if (!member) return null
          const pinned = pinnedMemberId === id

          return (
            <motion.button
              key={id}
              type="button"
              className={`member-chip${pinned ? ' member-chip--pinned' : ''}${
                member.kind === 'guest' ? ' member-chip--guest' : ''
              }`}
              onClick={() => onPin(id)}
              aria-pressed={pinned}
              layout={reduceMotion ? false : true}
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.86 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', bounce: 0, duration: 0.32 }
              }
            >
              <span
                className="member-chip__dot"
                style={{ background: colorOf(id) }}
                aria-hidden
              />
              {member.name}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
