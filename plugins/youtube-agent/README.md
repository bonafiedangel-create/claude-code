# youtube-agent

Eleven skills that run a YouTube channel. Adapted from
[Jake Schincariol's `youtube-agent-skill`](https://github.com/Jakeschincariol/youtube-agent-skill)
(MIT, see [LICENSE](LICENSE)) and repackaged here as a Claude Code plugin: each skill moved into
`skills/<name>/SKILL.md` + `scripts/`, and the two things the original scripts duplicated per file -
the transcript parser and the 21-formula hook library - pulled into one shared `lib/`.

One skill writes your script off 21 hook formulas and scores the hook before you waste a take on
it. One lints the title and the thumbnail as a single pairing, because writing them separately is
why half of your click surface says the same thing twice. One reads your audience-retention export
and tells you the exact second people left and what you were saying when they did. One turns a
transcript into an edit decision list. One finds the Shorts already hiding inside a long video. One
goes and finds what is working in your niche and ranks it by how far each video beat its own
channel, not by how big the channel is.

**Nothing gets published until you do it.** These skills write. You upload.

## The eleven

| skill | what it does |
| --- | --- |
| `yt-script` | One idea into a script. Five hooks off [21 formulas](lib/hooks.json), scored, then the spoken script with the retention beats marked. |
| `yt-package` | Title and thumbnail as one pairing, linted for truncation, duplication and vagueness. |
| `yt-edit` | A transcript into an edit decision list: dead air, filler cues, retakes, with timecodes. |
| `yt-comment` | The comment section triaged into four piles, then replies in your voice. Says which one to pin. |
| `yt-plan` | A week that fits the hours you actually have. One anchor, one cheap one, three Shorts. |
| `yt-viral` | What is working in your niche, ranked by multiple over each channel's own median. |
| `yt-retention` | Your retention export read properly: hook leak, the cliffs, the slide, and what to change. |
| `yt-shorts` | The Shorts already inside a long video, with a new first line written for each. |
| `yt-seo` | The description, the tags that are worth having, and the three queries this should win. |
| `yt-chapters` | Chapters from a transcript, validated against YouTube's own rules so they render. |
| `yt-audit` | The whole channel, ending in ONE fix rather than twenty. |

## Set up your voice

Spend ten minutes on [`templates/voice.md`](templates/voice.md) before using the writing skills.
Copy it to `~/.claude/youtube/voice.md` and fill it in, or send Claude three of your own videos and
say "write my voice.md from these". Every skill that writes copy reads that file. It matters more
here than anywhere else, because you have to say the words out loud.

## The six tools

Every one of these runs on a clean Python 3 with no dependencies.

```bash
python3 skills/yt-script/scripts/hookscore.py --hook "one line"        # 5-property hook panel
python3 skills/yt-package/scripts/title.py --title "..." --thumb "..." # title + thumbnail linter
python3 skills/yt-edit/scripts/deadair.py transcript.srt               # edit decision list
python3 skills/yt-chapters/scripts/chapters.py transcript.srt          # validated chapters
python3 skills/yt-retention/scripts/retention.py retention.csv         # where they left, and why
python3 skills/yt-viral/scripts/swipe.py collected.json --min 2.0      # outliers by own-channel multiple
```

`yt-edit`, `yt-chapters` and `yt-retention` share one `.srt`/`.vtt`/whisper-`.json` parser
(`lib/transcript.py`) so cue boundaries agree across tools. `yt-script` and `yt-viral` share one
21-formula hook library (`lib/hooks.json`) so a hook is classified the same way whether it is one
you're about to say or one a competitor already shipped.

## The fine print

**It does not publish.** YouTube's Data API would allow it with your own OAuth, but it is not built
here: every skill ends in a block you copy and a question - ship it, or change it?

**`hookscore.py` is a heuristic, not a predictor.** The panel was calibrated against 74 real
short-form hooks (the first 15 seconds of auto-captions, top-8 and bottom-8 by views across five
channels). It separates deliberately bad hooks from real ones well. It separates a given creator's
hits from their own misses barely at all. A low score is a reason to look again; a high score is
not a promise.

**The formula classifier is about the words, not the result.** When `yt-viral` says a title used
The Statistic, that is a judgement about the title you can see, not a claim about why the video got
its views.

**`yt-viral` reads, it does not scrape.** Public listings only. It never logs in as you and never
touches your credentials.

**Tags barely matter** and `yt-seo` says so instead of selling you a tag generator.

**Nothing invents a number.** If a skill wants a figure it does not have, it asks you for it or
writes the line without it.

## Licence

MIT, inherited from the upstream project - see [LICENSE](LICENSE). Use it, change it, ship it.
