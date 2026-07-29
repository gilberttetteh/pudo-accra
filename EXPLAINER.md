# What This Project Does — The Plain-English Version

> This is the non-technical explanation, written to be read aloud or handed to
> someone who doesn't work with maps or code. For the technical walkthrough —
> file names, algorithms, data formats — see [HOW_IT_WORKS.md](HOW_IT_WORKS.md).

---

## The problem, in plain terms

Right now if you order something in Accra, a courier drives to your door. That's
slow and expensive. The alternative is a **pickup point** — a shop or kiosk where
parcels wait for you to collect them. One van drops fifty parcels at one place
instead of driving to fifty houses.

But that only works if the pickup point is close enough that collecting is easier
than waiting at home. So the question becomes: **where do you put them, and how
many do you need?**

You could guess. Put one in every neighbourhood you've heard of. But then you'd
have three in Osu and none in Ashaiman, and you'd have no idea whether you'd
covered 40% of the city or 90%.

This system answers it properly.

---

## Step one: figure out where people actually live

Not where the neighbourhoods are — where the *people* are.

There's a dataset called WorldPop that's essentially a photograph of the whole
country, where each pixel is a 100-metre square, and instead of a colour, each
pixel holds a number: **how many people live in this square**.

Lay that over Greater Accra and Kasoa and add it all up: **5.2 million people**,
each one pinned to a specific 100-metre square. That's the demand.

---

## Step two: figure out how far people can really walk

This is the part most people get wrong, and it matters more than anything else.

If you draw a circle 800 metres wide around a shop, that circle is a lie. It might
cross the Korle Lagoon. It might cross the airport runway, or a wall, or a drain
with no bridge. People can't walk through those. They walk on **streets**.

So the system downloads every street, footpath, alley and staircase in Ghana from
OpenStreetMap, and builds them into a network — junctions connected by stretches
of road, each with a real length.

Now "10 minutes' walk" means something real: at a normal walking pace of about 80
metres a minute, you can cover 800 metres **following actual streets**. Someone
standing across a lagoon from a shop might be 200 metres away as a bird flies and
3 kilometres away on foot. The system knows the difference.

Then every one of those 5.2 million people gets attached to the nearest junction
to their home. Now people and roads are the same map.

---

## Step three: rule out where you can't build

A junction in the middle of a river is not a candidate. Neither is one inside the
airport, a military zone, a cemetery, a landfill, a wetland, or a factory
compound. Those all get removed.

Then it thins out what's left, keeping sites at least 250 metres apart — two
pickup points on the same street corner is one wasted pickup point.

One nice detail: **gated communities get special treatment.** If you're inside a
gated estate, you can't just walk to the nearest street corner — you can only
leave through the gate. So the system finds every gate and forces a candidate site
right at each entrance, even if the thinning rules would have removed it.

What's left is roughly a hundred thousand realistic places you could actually put
a pickup point.

---

## Step four: the clever bit

Now: which of those spots do you choose, and in what order?

You can't test every combination. If you're choosing 1,000 sites from 100,000
options, the number of possible combinations is larger than the number of atoms in
the universe. That's not an exaggeration.

So it does something smarter, and this is the heart of the whole thing:

> **Pick the single best site. Then ask "given that one is already built, which
> site now helps the most *remaining* people?" Pick that one. Repeat.**

Think of it like putting water taps in a village. You put the first tap where the
most people are. For the second tap, you don't put it right next to the first —
those people already have water. You put it where the most people *still without
water* are. Then the third. And so on.

The crucial move each round is that **people already covered stop counting**.
That's what stops all 1,000 pickup points from piling into Accra Central.

Run that until every reachable person is covered, and you don't get one answer —
you get a **numbered list** of every site, in order of how much good it does.
Site #1 helps the most people. Site #2 helps the most people who site #1 missed.
Site #4,000 helps a handful in a village somewhere.

---

## Why that list answers every question at once

This is why the app feels instant.

Because the list is in order of usefulness, you don't need to re-run anything when
someone changes their mind. Want to cover 80% of the city? Read down the list
until the running total hits 80%, and stop — everything above that line is your
answer. Want 95%? Keep reading further down. Want to know what 300 sites gets
you? Read the first 300.

It's a numbered shopping list sorted by value for money. You stop wherever your
budget runs out, and everything above the line is automatically the best set you
could have bought.

That's also why there's no server to run. The hard thinking was done once, up
front. The website just reads down a list.

---

## What it found

At a **10-minute walk**, covering **95% of Greater Accra takes 1,649 pickup
points** — reaching about 4.96 million people.

Now the interesting part. Change how far you're willing to make people walk:

| Willing to walk | Pickup points needed for 95% coverage |
| --------------- | ------------------------------------- |
| 20 minutes      | **369**                               |
| 15 minutes      | **682**                               |
| 10 minutes      | **1,649**                             |
| 7 minutes       | **3,721**                             |
| 5 minutes       | **8,951**                             |

Halving the walk from 10 minutes to 5 doesn't double the cost — it multiplies it
by more than five. That's the real finding, and it's a business decision, not a
technical one: *how much convenience are you buying, and at what price?*

---

## One last thing: you can't ever reach everyone

At a 5-minute walking limit, the absolute best you can do is **95.4%** of the
population — even with unlimited money and a pickup point on every legal corner.
The last 4.6% simply live too far from anywhere you're permitted to build.

The app shows this as a **reachable ceiling**, and it's important, because it stops
someone from asking "why can't we hit 99% at 5 minutes?" The answer isn't that the
system isn't trying hard enough. It's geography.

| Willing to walk | Most of the population you could *ever* reach |
| --------------- | --------------------------------------------- |
| 5 minutes       | 95.4%                                         |
| 7 minutes       | 97.5%                                         |
| 10 minutes      | 98.4%                                         |
| 15 minutes      | 99.3%                                         |
| 20 minutes      | 99.7%                                         |

---

## If someone pushes back

**"Is this the perfect answer?"**
No, and it doesn't claim to be. Finding the mathematically perfect set is a problem
computers can't solve at this scale — it's one of the known-hard ones. The method
used here is the standard approach, and it comes with a proof that it lands within
a known distance of perfect. Say **near-optimal**, not optimal.

**"How current is the data?"**
The roads come from OpenStreetMap, which is updated continuously but is only as
complete as the people mapping Accra have made it. The population figures are
WorldPop 2020, which is a model built from census data and satellite imagery — not
a door-to-door count.

**"What isn't accounted for?"**
Walking speed is a flat 80 metres per minute for everyone — no hills, no traffic,
no rain, no difference between a fit adult and someone carrying a child. And the
whole thing optimises for *one* thing: walking access. It says nothing about land
cost, security, electricity, or whether the shop owner at that corner wants the
business.

Those are the honest limits. They don't undermine the result — a plan that gets
walking access right is a much better starting point than a plan that guesses —
but they're worth saying out loud before someone else says them for you.
