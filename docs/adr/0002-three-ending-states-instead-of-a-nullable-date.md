# A Run's ending is three states, not a nullable date

The obvious model would be `end: Date | null`, where `null` means "still going".
That conflates two completely different cases: a Run that genuinely still runs
(League of Legends since 2014) and one that simply has no known end, because it did
not stop — it **faded** (Metin2, Dark Orbit, Cube World). In a group of friends,
games typically end the second way, so this is not an edge case but the common one.
The ending is therefore three explicit states: **Running / Closed / Faded**.
For the same reason the start date carries an explicit **Precision** (month / season
/ year) instead of a decimal year with invented accuracy.

## Consequences

- Data entry is allowed to answer "we don't know". This is deliberate: missing
  precision must not block data collection, and must not breed invented dates.
- Anyone who later "cleans this up" into a single nullable end date **destroys
  information** that cannot be recovered.
- How the three states and the two precision levels are drawn is deliberately not
  decided here. The only requirement is that they be distinguishable.
