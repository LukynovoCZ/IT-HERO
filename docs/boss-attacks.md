# Active bosses — 0.28.2

The final manager pursues the player between attacks, hops over blocked furniture,
and rotates three ping-pong balls, a targeted jump, three gold cards and a close
paddle strike. The target position is captured before jumping; flight does not
track the player. A jump strikes only after landing, with a timeout fallback to
prevent a stuck attack. Existing health and damage values are retained.

Easy / Normal / Hard windups are 950 / 800 / 600 ms; cooldowns are
2400 / 2000 / 1500 ms, plus existing global difficulty scaling. Recovery has
750 / 750 / 450 ms of stationary breathing room. At two HP cooldown drops 15%.
Tune these in `final-manager.js`, `tuning()` and `config`.

Design manager golf balls now launch 48 px above the feet with gravity 520.
The target distance determines flight time (0.65–1.25 s), producing a lob that
clears furniture and descends toward the original target. Ordinary table
collisions remain enabled; the lob does not pass through solid furniture.
Other trio projectiles retain their previous trajectories. Tune the golf branch
of `ITHeroTrioAttacks.projectile` in `trio-attacks.js`.

`node tests/boss-pressure.cjs` checks all attack types on all three difficulties,
chase direction, no midair melee damage, floor cancellation, six real-physics
lobs over an actual desk (both directions, all tiers), plus a running jump,
landing and recovery. `node tests/public-copy.mjs` checks the published build.
Use `IT_HERO_PREVIEW_URL` to select the local server for the boss test.
