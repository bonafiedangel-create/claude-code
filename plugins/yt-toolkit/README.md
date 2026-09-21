# yt-toolkit

Four transcript-driven skills for editing and packaging a YouTube video. Every tool reads a
timestamped transcript (`.srt`, `.vtt`, or a Whisper `.json`) and/or a Studio export, and prints a
block for you to review — nothing here touches media or publishes anything on its own.

| Skill | Use for | Script |
|---|---|---|
| `/yt-edit` | dead air, filler words, restarted takes | `skills/yt-edit/scripts/deadair.py` |
| `/yt-chapters` | YouTube chapter timestamps, validated against YouTube's own rules | `skills/yt-chapters/scripts/chapters.py` |
| `/yt-retention` | where the audience-retention graph says viewers actually leave | `skills/yt-retention/scripts/retention.py` |
| `/yt-hook` | score a hook / opening line before you shoot it | `skills/yt-hook/scripts/hookscore.py` |

## How the pieces fit

`yt-edit`, `yt-chapters` and `yt-retention` all need to read the same kind of file, so there is one
parser — `lib/transcript.py` — that the other three import rather than reimplementing. `yt-hook`
is independent: it scores a line of text, not a transcript, against a small formula library in
`skills/yt-hook/scripts/hooks.json`.

```
yt-toolkit/
  lib/transcript.py           # shared .srt / .vtt / whisper .json parser
  skills/
    yt-edit/       SKILL.md  scripts/deadair.py
    yt-chapters/   SKILL.md  scripts/chapters.py
    yt-retention/  SKILL.md  scripts/retention.py
    yt-hook/       SKILL.md  scripts/hookscore.py  scripts/hooks.json
```

## Try it

```bash
python3 skills/yt-edit/scripts/deadair.py transcript.srt
python3 skills/yt-chapters/scripts/chapters.py transcript.srt --target 8
python3 skills/yt-retention/scripts/retention.py retention.csv --transcript transcript.srt
python3 skills/yt-hook/scripts/hookscore.py --hook "Why nobody tells you this before you start"
```

Every tool also takes `--json` for machine-readable output.

## Requirements

Python 3.8+, standard library only — no dependencies to install.

## The gate

Nothing in this plugin publishes anything. Each skill writes a draft — chapters, an edit decision
list, a retention read, a hook score — and ends by asking whether to ship it or change it. You
always make the last call.
