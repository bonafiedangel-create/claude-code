---
name: yt-edit
description: >-
  Turn a timestamped transcript into an edit decision list - dead air,
  filler words, and restarted takes. Use for "tighten this edit", "cut the
  dead air", "find the retakes", or a pasted .srt/.vtt/whisper transcript
  with no other ask attached.
---

# yt-edit

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/yt-edit/scripts/deadair.py" transcript.srt
python3 "${CLAUDE_PLUGIN_ROOT}/skills/yt-edit/scripts/deadair.py" transcript.srt --floor 0.35 --json
```

`deadair.py` finds three things from the gaps and repeats in the transcript, not from the audio:

- **DEAD** - gaps between spoken cues longer than the floor (default 0.45s).
- **FILLER** - cues that are only filler ("um", "so yeah", "basically").
- **REPEAT** - a restarted sentence, matched against the last cue that was actually speech so a
  filler word between two takes doesn't hide the retake.

## What this is not

It prints an edit decision list - kind, start, end, why - and the total runtime it would remove.
It does not touch media. You apply the cuts in whatever editor you use. Treat the `--floor` value
as a knob: raise it on a chatty, fast-paced channel where a beat of silence is intentional, lower
it on a slow, deliberate one where 0.45s already reads as dead air.

This is also the shared transcript parser for `/yt-chapters` and `/yt-retention` - one `.srt`/
`.vtt`/whisper-`.json` loader, used by all three, so the cue boundaries agree across tools.

## The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**
