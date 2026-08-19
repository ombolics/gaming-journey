# The Run is the atomic unit of the timeline, not a point-in-time event

Two prototypes were built with two incompatible data models: the HTML one stored
durations (`{start, end, who[]}`), the React one stored point-in-time events
(`{year, exactDate, players[]}`). We chose the **Run** (start + end + who), because
it is the only model that handles all four temporal shapes that actually occur
without a separate mechanism for each: the bounded stretch, the repeating season
(= several Runs of the same Game), the Evergreen (= a long, quiet Run) and the
Moment (= a point inside a Run). Membership is a duration anyway, so this keeps a
single notion of time on the canvas.

## Consequences

- The React prototype's `ambient: {lol, wot, tft}` field disappears. An Evergreen is
  now an ordinary Run, rendered more quietly. That field was a symptom: the event
  model had no way to express continuity.
- The React prototype's "one event = one screen" scroll-snap experience is **lost**.
  With Runs you cannot page through screen by screen, because Runs overlap — that is
  the whole point of them. Scrolling becomes continuous, with the HTML prototype's
  stroke-dashoffset draw-in.
- Data entry gets more expensive: eleven years on, the **end** of a Run is often
  unknown. We handle that with explicit precision, not invented dates.
