# Legacy — superseded PDF source

These two files used to produce `assets/documents/portfolio.pdf`:

| File                  | What it was                                            |
| --------------------- | ------------------------------------------------------ |
| `portfolio-src.html`  | A hand-maintained second copy of the portfolio content |
| `portfolio-print.css` | Its print stylesheet                                   |

**They are no longer used.** They were the reason the site and the PDF drifted
apart: any edit to `index.html` had to be repeated here by hand, and in practice
it was not — the generated PDF still described the pre-capstone version of the
site months later.

The PDF is now printed directly from `index.html` using `css/print.css`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-pdf.ps1
```

One source of content, so the two cannot disagree.

These files are kept only in case you want to lift wording out of the old
document. Nothing references them, and you can delete this folder whenever you
are happy with the generated PDF.
