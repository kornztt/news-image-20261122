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

Stories on the page:

- Mexico captures "El Chapo Isidro" (Fausto Isidro Meza Flores) in Sinaloa.
- Zelenskyy calls Putin a "killer" after Trump calls him a friend; Kyiv says
  the US wants three-way talks before Christmas.
- Iran strikes US bases in Bahrain; Tehran claims two Patriot radars hit,
  Bahrain says a civilian site burned and no one was hurt.
- COP31 nears a deal after its fossil-fuel deadlock in Antalya.
- Alcaraz faces Zverev for the ATP Finals title.
- Also: FBI probes an apparent hack of its crime database; a 6.7 magnitude
  quake hits Peru's Andes with no casualties.

Run it with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
