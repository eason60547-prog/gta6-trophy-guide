# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/eason60547-prog/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/eason60547-prog/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — a complete GTA VI trophy guide and tracker for PlayStation 5.

Every one of the 55 trophies, with its official name, description and grade, plus an own-words guide that cites its sources. **1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden · 0 online.** The platinum is *Vice Got a Price!* — about 200 hours at 4/10 difficulty (PowerPyx), one playthrough, no online play needed.

## What's inside

- **Checklist** — all 55 trophies with a guide each. Search, filter by grade (platinum / gold / silver / bronze) and by kind (story, side, activities, combat, exploration, money, collectibles), hide earned trophies, and switch on spoiler-free mode to hide story trophies until you earn them.
- **Roadmap to the platinum** — five stages in order: story first, then side strands, activities, collectibles, and a final 100% cleanup. Each stage lists the trophies it covers and what it asks for.
- **Missables** — only one trophy is flagged as possibly missable: *Positive Mental Attitude* (meditate at every spot as you find it). The other 12 story trophies unlock in mission order and cannot be missed; everything else stays available in free roam after the credits.
- **Tracker** — tick trophies off as you earn them. Progress is saved in your browser (localStorage) only, with export to and import from a `.json` file and a reset button. No account, no server, no network requests.

Trophy names, descriptions and grades are the official PlayStation list, cross-checked against Exophase and PSNProfiles (the two agreed on every name, description and grade, checked 2026-11-20). Counts and method notes come from PowerPyx, GameMapa, Sixshore and KeenGamer — each guide names its sources beside it. The full source list is in `app/data/trophies.json`. Guides are written in our own words for this entry; nothing is copied from another guide. No Rockstar artwork or logo is used, and the guide works fully offline.

One warning worth keeping: PowerPyx reports that cheats disable trophies and saving, so keep them off the save you use for the platinum.

## Run it

```sh
node serve.ts
```

Open http://localhost:8080 in desktop Chrome. No build step, no network requests, fully offline.

<sub>Entered on [make.fun](https://make.fun/?ref=mz84a1xs&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
