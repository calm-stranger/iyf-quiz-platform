#!/usr/bin/env python3
"""
Builds printable QR sheets for the Utkarsh quiz.

    python3 scripts/build-qr.py https://your-app.vercel.app/utkarsh

Writes two files next to the script's project root:

    print/quiz-qr-poster.html   one A4, one very large QR — for a wall
    print/quiz-qr-cards.html    one A4 cut into four A6 table cards

Print A4, 100%, no margins, background graphics ON.

The QR is drawn as inline SVG rather than a PNG: it stays sharp at any size,
the file needs nothing else to render, and a QR that is soft at the edges is a
QR that a cheap phone camera gives up on.
"""
import pathlib
import sys

import qrcode

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "print"

NAVY, PINK, INK = "#1b3a9c", "#e5187f", "#14204a"


def qr_svg(url: str, px: float) -> str:
    """QR as one SVG <path>, so the markup stays small."""
    # High error correction: these get printed, taped to tables and smudged.
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=2)
    q.add_data(url)
    q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    d = []
    for y, row in enumerate(m):
        for x, cell in enumerate(row):
            if cell:
                d.append(f"M{x} {y}h1v1h-1z")
    return (
        f'<svg viewBox="0 0 {n} {n}" width="{px}mm" height="{px}mm" '
        f'shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="{n}" height="{n}" fill="#fff"/>'
        f'<path d="{"".join(d)}" fill="{INK}"/></svg>'
    )


CSS = f"""
@page {{ size: A4 portrait; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{
  width: 210mm; background: #fff; color: {INK};
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
.wordmark {{ font-weight: 800; letter-spacing: 0.06em; color: {NAVY}; line-height: 1; }}
.wordmark small {{ display:block; font-weight:700; color: {PINK}; letter-spacing:0.14em; }}
.url {{ font-family: "SF Mono", Menlo, monospace; font-weight: 700; word-break: break-all; }}
"""

POSTER = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Utkarsh — Quiz QR (poster)</title><style>%(css)s
.sheet { width:210mm; height:297mm; padding:18mm 16mm; display:flex; flex-direction:column;
         align-items:center; text-align:center; }
.wordmark { font-size:16mm; } .wordmark small { font-size:3.6mm; margin-top:2.5mm; }
h1 { font-size:11mm; font-weight:800; margin-top:9mm; }
.sub { font-size:5mm; color:#52525b; margin-top:3mm; }
.qr { margin-top:10mm; padding:6mm; border:1.2mm solid %(navy)s; border-radius:4mm; }
.url { font-size:5mm; margin-top:8mm; color:%(navy)s; }
.steps { margin-top:9mm; font-size:4.4mm; color:#3f3f46; line-height:1.7; }
</style></head><body><div class="sheet">
  <div class="wordmark">UTKARSH<small>AN INTER SCHOOL CULTURAL EXTRAVAGANZA</small></div>
  <h1>Vedic Quiz</h1>
  <p class="sub">Scan to begin &middot; then choose your group</p>
  <div class="qr">%(qr)s</div>
  <p class="url">%(url)s</p>
  <p class="steps">
    Group A &middot; Class 1 to 4 &nbsp;|&nbsp; Group B &middot; Class 5 to 7 &nbsp;|&nbsp; Group C &middot; Class 8 to 10<br>
    Use your own phone &middot; Do not switch apps once you begin
  </p>
</div></body></html>"""

CARDS = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Utkarsh — Quiz QR (table cards)</title><style>%(css)s
.sheet { width:210mm; height:297mm; display:grid;
         grid-template-columns:105mm 105mm; grid-template-rows:148.5mm 148.5mm; position:relative; }
.sheet::after { content:""; position:absolute; left:105mm; top:0; bottom:0; border-left:0.3mm dashed #b9c0d8; }
.sheet::before { content:""; position:absolute; top:148.5mm; left:0; right:0; border-top:0.3mm dashed #b9c0d8; }
.card { padding:9mm 8mm; display:flex; flex-direction:column; align-items:center; text-align:center; }
.wordmark { font-size:7.5mm; } .wordmark small { font-size:1.7mm; margin-top:1.4mm; }
h1 { font-size:5.4mm; font-weight:800; margin-top:4mm; }
.sub { font-size:2.6mm; color:#52525b; margin-top:1.5mm; }
.qr { margin-top:4mm; padding:2.5mm; border:0.6mm solid %(navy)s; border-radius:2mm; }
.url { font-size:2.5mm; margin-top:4mm; color:%(navy)s; }
.grp { margin-top:auto; font-size:2.3mm; color:#3f3f46; line-height:1.6; }
</style></head><body><div class="sheet">%(cards)s</div></body></html>"""

CARD = """<div class="card">
  <div class="wordmark">UTKARSH<small>AN INTER SCHOOL CULTURAL EXTRAVAGANZA</small></div>
  <h1>Vedic Quiz</h1>
  <p class="sub">Scan to begin, then choose your group</p>
  <div class="qr">%(qr)s</div>
  <p class="url">%(url)s</p>
  <p class="grp">A &middot; Class 1-4 &nbsp; B &middot; Class 5-7 &nbsp; C &middot; Class 8-10</p>
</div>"""


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: build-qr.py <quiz-url>\n"
                         "  e.g. build-qr.py https://your-app.vercel.app/utkarsh")
    url = sys.argv[1].strip()
    if not url.startswith("http"):
        raise SystemExit(f"That does not look like a URL: {url!r}")

    OUT.mkdir(exist_ok=True)
    shown = url.replace("https://", "").replace("http://", "").rstrip("/")

    (OUT / "quiz-qr-poster.html").write_text(
        POSTER % {"css": CSS, "navy": NAVY, "qr": qr_svg(url, 110), "url": shown})

    card = CARD % {"qr": qr_svg(url, 52), "url": shown}
    (OUT / "quiz-qr-cards.html").write_text(
        CARDS % {"css": CSS, "navy": NAVY, "cards": card * 4})

    print(f"encoded: {url}")
    print(f"  {OUT.relative_to(ROOT)}/quiz-qr-poster.html   one big QR, A4")
    print(f"  {OUT.relative_to(ROOT)}/quiz-qr-cards.html    four A6 table cards")


if __name__ == "__main__":
    main()
