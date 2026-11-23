# THE WORLD TODAY — Sunday 22 November 2026

[![make.fun](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/kornztt/news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/kornztt/news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122)

A one-day news front page for Sunday 22 November 2026, drawn entirely in code.

`main.ts` (Node 22, standard library only) draws the whole page — masthead,
five stories and a code-drawn illustration of the lead story — with its own
5x7 pixel font and its own PNG encoder, and writes it to
`$MAKEFUN_OUTPUT_DIR/entry.png`. No network, no external images, fully
deterministic: every run writes the same bytes.

Stories on the page (all from Sunday 22 November 2026):

- Mexico capture aftermath: "El Chapo Isidro" held in Mexico City after
  the Guasave raid; eleven died, and experts fear a bloody fight for his
  cartel.
- G20 opens in Johannesburg, the first summit on African soil, without
  the US; envoys agree a draft text.
- Iran says it hit US bases in Bahrain; Tehran claims two Patriot radars
  hit, Bahrain says a civilian site burned and two people were hurt, one
  critically.
- COP31 collapses without a deal after the EU rejects a draft that
  ignores fossil fuels.
- Alcaraz beats world number one Zverev 6-2, 7-6 in Turin to win his
  first ATP Finals title.
- Also: two tankers hit in the Strait of Hormuz; Iran says it downed a
  US drone.

Run it with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
