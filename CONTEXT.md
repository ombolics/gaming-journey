# Gaming Journey

A visual chronicle of one group of friends' shared gaming history since 2014.
The site does exactly one thing: it shows **who played what, when, and with whom**.

Documentation, code and identifiers are in English. Hungarian appears only in the
UI copy and in the data content itself; the Hungarian label for each term is given
below so the two stay in sync.

## Language

### Time

**Run** — _UI: "Szakasz"_
The atomic unit of the timeline. One specific Game, played by one specific set of
Members, across a bounded stretch of time. The same Game can produce several Runs.
_Avoid_: event, entry, session, playthrough

**Moment** — _UI: "Pillanat"_
A memorable, point-in-time thing that happened inside a Run — one night, one joke,
one disaster. It never stands alone: it always belongs to a Run.
_Avoid_: highlight, story, milestone

**Era** — _UI: "Korszak"_
The stretch of time during which the group used one voice platform
(Skype → TeamSpeak 3 → Discord). Background context; it belongs to the group as a
whole, not to individual Members.
_Avoid_: period, phase, age

**Precision** — _UI: "Pontosság"_
The smallest time unit a Run's date is actually known to: month, season, or year.
It is separate data because, eleven years on, most dates are not known to the month,
and invented precision is a lie. The rendering must distinguish a precise date from
a vague one.
_Avoid_: accuracy, margin, estimate

**Ending** — _UI: "Végállapot"_
A Run can finish in three ways, and these are **different things**:
- **Running** (_"Fut"_) — still going, no end.
- **Closed** (_"Lezárult"_) — stopped at a known time, for a recognisable reason.
- **Faded** (_"Elhalt"_) — no end date, it simply ran out. This is the most common case.

All three must be visually distinguishable. **Faded is not missing data** — it is a
valid state in its own right, and must never be filled in with an invented end date.
_Avoid_: end, finished, stopped (as an umbrella term for all three)

**Unverified** — _UI: "Ellenőrizetlen"_
A Run whose timing is still a hypothesis rather than something checked against
evidence or the group's memory. Distinct from low Precision: a Run can be honestly
known to year precision and be verified, or be month-precise and still be a guess.
Clearing this flag, Run by Run, is what data collection consists of.
_Avoid_: draft, todo, provisional

### People

**Member** — _UI: "Tag"_
A person in the group. Gets their own colour and their own lane on the timeline.
Comes in two kinds, and this is **stated data, not computed**: **Regular**
(_"Állandó tag"_ — the core of the group) or **Guest** (_"Beugró"_ — someone who
joined for one or two Runs). The distinction is social, not statistical; no
threshold decides it.
_Avoid_: friend, player, user, participant

**Activity** — _UI: "Aktivitás"_
How present a Member was at a given point in time. **Derived**: it follows from how
many Runs they appear in at that moment. It needs its own word because membership
and activity are not the same thing — a Member can belong to the group while not
playing with anyone. Presence is not a flat interval but a rhythm, with stretches
that go quiet and flare up again.
_Avoid_: intensity, presence, engagement

### Games

**Game** — _UI: "Játék"_
The game title itself, independent of any playing of it. It is a concept of its own
because one Game can have several Runs years apart (Minecraft, Tanki Online,
Guild Wars 2).
_Avoid_: title, entry

**Evergreen** — _UI: "Örökzöld"_
A property of a Run, not a separate concept: a Run that goes on quietly for years
underneath the others (League of Legends since 2014). Visually quieter, but exactly
the same data structure.
_Avoid_: ambient, background stream, constant
