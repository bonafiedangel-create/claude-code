#!/usr/bin/env python3
"""retention.py - read a YouTube Studio audience-retention export and say where viewers leave.

    python3 retention.py retention.csv --duration 600
    python3 retention.py retention.csv --transcript transcript.srt
    python3 retention.py retention.csv --duration 600 --transcript transcript.srt --json

Three problems, scored separately because each needs a different fix:
  HOOK LEAK   retention lost in the first 30 seconds - a script problem, never an edit problem
  CLIFFS      single steep drops - a moment, not a trend. With --transcript, prints what was
              being said there
  SLIDE       the steady bleed across the middle 80% of runtime - pacing, fixed by cutting

Studio's CSV gives video position and retention as fractions of the video, not seconds, so talking
about "the first 30 seconds" needs a duration - pass --duration, or let it infer one from the last
cue of --transcript. Without either, times fall back to percent-of-runtime.
"""
import csv, json, os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "lib"))
from transcript import load  # noqa: E402  (shared parser, one implementation)

def mmss(t):
    t = int(t); h, m, s = t // 3600, (t % 3600) // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

def read_csv(path):
    with open(path, encoding="utf-8-sig", errors="replace", newline="") as f:
        rows = list(csv.reader(f))
    if not rows: return []
    header = [h.strip().lower() for h in rows[0]]
    pos_i = next((i for i, h in enumerate(header) if "position" in h), 0)
    # Prefer absolute retention (share of all viewers still watching) over "relative" (percentile
    # against similar videos) - relative tells you nothing about where THIS video loses people.
    ret_i = next((i for i, h in enumerate(header) if "absolute" in h and "retention" in h), None)
    if ret_i is None:
        ret_i = next((i for i, h in enumerate(header) if "retention" in h), 1 if len(header) > 1 else 0)
    points = []
    for r in rows[1:]:
        if len(r) <= max(pos_i, ret_i) or not r[pos_i].strip():
            continue
        try:
            pos, ret = float(r[pos_i]), float(r[ret_i])
        except ValueError:
            continue
        points.append((pos, ret))
    points.sort()
    # Studio sometimes exports whole percents (0-100), sometimes fractions (0-1). Normalize to
    # fractions so every calculation below is in one unit.
    if points and max(p for p, _ in points) > 1.5:
        points = [(p / 100, r) for p, r in points]
    if points and max(r for _, r in points) > 1.5:
        points = [(p, r / 100) for p, r in points]
    return points

def main():
    a = sys.argv[1:]
    as_json = "--json" in a; a = [x for x in a if x != "--json"]
    duration = float(a[a.index("--duration") + 1]) if "--duration" in a else None
    transcript_path = a[a.index("--transcript") + 1] if "--transcript" in a else None
    a = [x for x in a if not x.startswith("--") and not re.match(r"^[\d.]+$", x) and x != transcript_path]
    if not a or not os.path.exists(a[0]): print(__doc__); sys.exit(1)
    points = read_csv(a[0])
    if len(points) < 5:
        print("too few data points to read - is this the audience-retention CSV, not the summary?")
        sys.exit(1)

    cues = None
    if transcript_path:
        if not os.path.exists(transcript_path):
            print(f"transcript not found: {transcript_path}"); sys.exit(1)
        cues = load(transcript_path)
        if duration is None and cues:
            duration = cues[-1][1]

    def at(t_pos):
        for p, r in points:
            if p >= t_pos:
                return r
        return points[-1][1]

    start = points[0][1]

    # HOOK LEAK
    if duration:
        leak_pos = min(30 / duration, 1.0)
        leak_label = "first 30s"
    else:
        leak_pos = 0.05
        leak_label = "first 5% (no duration - pass --duration or --transcript for seconds)"
    hook_leak = round((start - at(leak_pos)) * 100, 1)

    # CLIFFS: steepest single-step drops, flagged against the export's own median step so a
    # naturally choppy CSV doesn't just report its own noise floor as cliffs.
    steps = [(r0 - r1, p0, p1) for (p0, r0), (p1, r1) in zip(points, points[1:]) if r0 - r1 > 0]
    cliffs = []
    if steps:
        drops = sorted(d for d, _, _ in steps)
        median = drops[len(drops) // 2]
        threshold = max(median * 3, 0.02)
        for drop, p0, p1 in sorted(steps, reverse=True):
            if drop < threshold or len(cliffs) >= 5:
                break
            said = None
            if cues and duration:
                window = [c[2] for c in cues if c[1] >= p0 * duration and c[0] <= p1 * duration]
                said = " ".join(window)[:140] or None
            cliffs.append({"position": round(p1, 3),
                           "at": round(p1 * duration, 1) if duration else None,
                           "drop": round(drop * 100, 1), "said": said})

    # SLIDE: linear trend across the middle 10%-90%, away from the hook and the end-card bump.
    mid = [(p, r) for p, r in points if 0.10 <= p <= 0.90]
    slide = None
    if len(mid) >= 2:
        n = len(mid)
        mean_p = sum(p for p, _ in mid) / n
        mean_r = sum(r for _, r in mid) / n
        num = sum((p - mean_p) * (r - mean_r) for p, r in mid)
        den = sum((p - mean_p) ** 2 for p, r in mid) or 1e-9
        slope = num / den  # retention lost per fraction of video traversed
        slide = round(-slope * 0.8 * 100, 1)  # loss over the 80%-wide middle window, in points

    end = round(points[-1][1] * 100, 1)

    verdict = {"hook_leak_pct": hook_leak, "hook_leak_window": leak_label,
               "hook_leak_healthy": hook_leak <= 25, "cliffs": cliffs,
               "slide_pct": slide, "end_retention_pct": end, "duration": duration}
    if as_json:
        print(json.dumps(verdict, indent=1)); return

    print(f"\n  {a[0]}   {len(points)} points" + (f", {duration:.0f}s" if duration else "") + "\n")
    print(f"  HOOK LEAK   {hook_leak:5.1f} pts lost in the {leak_label}"
          f"   {'(healthy)' if hook_leak <= 25 else '(fix the script, not the edit)'}")
    if cliffs:
        print("\n  CLIFFS")
        for c in cliffs:
            where = mmss(c["at"]) if c["at"] is not None else f"{c['position']*100:.0f}%"
            said = f'   "{c["said"]}"' if c["said"] else ""
            print(f"    {where:>8}   -{c['drop']:.1f} pts{said}")
    else:
        print("\n  CLIFFS      none above the noise floor")
    if slide is not None:
        flat = abs(slide) < 8
        print(f"\n  SLIDE       {slide:+.1f} pts across the middle 80% of runtime"
              f"   {'(flat, fine)' if flat else '(steady bleed - cut, do not rewrite)'}")
    print(f"\n  ends at {end:.1f}% retention\n")

if __name__ == "__main__":
    main()
