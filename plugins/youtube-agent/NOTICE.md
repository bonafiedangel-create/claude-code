# Attribution

This plugin is a derivative work under the MIT License. Two layers of credit apply, and MIT
requires the first one to stay intact in any copy:

## Upstream

The five Python tools (`deadair.py`, `chapters.py`, `hookscore.py`, `title.py`, `swipe.py`,
`retention.py`), the 21-formula hook library, `templates/voice.md`, and the substance of every
`SKILL.md` are [Jake Schincariol's `youtube-agent-skill`](https://github.com/Jakeschincariol/youtube-agent-skill),
MIT licensed. See [LICENSE](LICENSE) for the original copyright notice - required verbatim, per the
license's own terms, in every copy of this software.

## This fork

Maintained by Marilene & Co (Marileneandco@gmail.com) for personal use. Changes made here, on top
of the upstream original:

- Restructured for the Claude Code plugin format: each skill's script moved into its own
  `skills/<name>/scripts/`, invoked from `SKILL.md` via `${CLAUDE_PLUGIN_ROOT}`.
- Pulled the logic every script duplicated into one shared copy each: `lib/transcript.py` (the
  `.srt`/`.vtt`/whisper-`.json` parser used by `yt-edit`, `yt-chapters` and `yt-retention`) and
  `lib/hooks.json` (the 21-formula library used by `yt-script` and `yt-viral`).
- Fixed the cross-skill import paths those scripts used under the original flat layout, which broke
  once the scripts moved into per-skill `scripts/` folders.
- Simplified a redundant tuple round-trip in `retention.py`'s slide calculation (behavior-identical,
  confirmed against a test fixture before and after).
- Re-tested all six scripts end to end against synthetic transcript/CSV/JSON fixtures after every
  structural change.

None of this changes what the tools do - it is packaging and plumbing, not a rewrite of the
approach, the formulas, or the scoring logic, which remain Jake Schincariol's.
