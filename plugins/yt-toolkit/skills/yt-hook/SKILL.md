---
name: yt-hook
description: >-
  Score a YouTube hook - the first line of script - before a take gets
  wasted on it. Use for "is this hook good", "rate my opening line", "which
  hook is stronger", or a pasted list of candidate hooks/openings.
---

# yt-hook

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/yt-hook/scripts/hookscore.py" --hook "one line"
python3 "${CLAUDE_PLUGIN_ROOT}/skills/yt-hook/scripts/hookscore.py" hooks.txt   # one per line, ranked
```

## Five properties, one weakest-link verdict

SPECIFICITY, ADDRESS, STAKES, CURIOSITY, BREVITY - each 0-100. The verdict is 60% the mean and 40%
the weakest property, on purpose: a hook with four strong properties and one dead one leaks at the
dead one, and an average hides that. Fix the weakest property first; `hookscore.py` names it and
suggests the fix.

It also classifies the hook against a small library of common formulas (curiosity gap, direct
callout, stat shock, before/after, ...) in `hooks.json`. A hook that matches no formula usually
means the line is a summary of the video, not an opener for it.

## What this can and cannot tell you

Validated against real short-form hooks, it separates a deliberately bad hook from a real one
well, and separates a creator's own hits from their own misses only weakly. A low score is a
reason to rewrite. A high score is not a promise - it still has to survive being said out loud on
camera.

## The gate

This scores candidates, it does not pick one for the user. When ranking several hooks, name the
winner and the single weakest property behind it, then ask: **which one, or another pass?**
