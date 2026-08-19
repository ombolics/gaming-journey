import { Timeline } from './components/Timeline'
import { useCanvasWidth } from './components/useCanvasWidth'
import { GAMES } from './data/games'
import { MEMBERS } from './data/members'
import { RUNS } from './data/runs'
import { FIRST_YEAR } from './timeline/layout'
import { nowAsYear } from './timeline/time'

export default function App() {
  const width = useCanvasWidth()

  // The hero counts what is actually in the data, so it grows as the data
  // lands rather than reading as empty (docs/SCOPE.md).
  const stats = [
    { value: Math.floor(nowAsYear()) - FIRST_YEAR, label: 'év' },
    { value: MEMBERS.length, label: 'ember' },
    { value: GAMES.length, label: 'játék' },
    { value: RUNS.length, label: 'közös szakasz' },
  ]

  return (
    <>
      <header className="hero">
        <p className="hero__eyebrow">2014 —</p>
        <h1 className="hero__title">Gaming Journey</h1>
        <p className="hero__lead">
          Ennyi minden történt velünk, mióta először összeültünk játszani.
        </p>
        <dl className="stats">
          {stats.map((stat) => (
            <div className="stats__item" key={stat.label}>
              <dt className="stats__value">{stat.value}</dt>
              <dd className="stats__label">{stat.label}</dd>
            </div>
          ))}
        </dl>
        <p className="hero__scroll">görgess lefelé</p>
      </header>

      <main className="canvas">
        <Timeline width={width} />
      </main>
    </>
  )
}
