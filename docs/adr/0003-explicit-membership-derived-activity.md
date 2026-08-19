# Membership is stated data, activity is derived

A Member's lane exists from their stated join date until they leave (or until today),
but whether that lane is strong or faint at any point is computed from their Run
participation. A plain `{joined, left}` interval is not enough, because real presence
is intermittent: Szilárd is a founder in 2014, goes quiet later that same year,
returns in 2016, flares up once in 2020. A flat ribbon would turn that into a lie.
Purely derived presence is not enough either, because it would erase the difference
between **not being there** and **being there but not playing**.

For the same reason the **Regular / Guest** distinction stays stated data rather than
being computed from a Run count: it is a social fact, not a statistic. An arbitrary
threshold would be giving a machine answer to an emotionally real question.

## Consequences

- Only one new field is needed (`joined`); activity comes for free from the Runs.
- Fading lanes are what make it possible to fit fourteen people on one canvas:
  inactive stretches visually recede.
- Anyone who later removes the Guest flag in favour of "let's just compute it" is
  overriding a deliberate decision.
