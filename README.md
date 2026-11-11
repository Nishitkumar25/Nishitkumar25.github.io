# Nishit Kumar — Engineering Portfolio

Personal portfolio website and matching downloadable portfolio PDF for
**Nishit Kumar** — Associate Technical Consultant at Perficient Inc.,
Product Development (Custom Delivery), Bengaluru.

**Live site:** <https://nishitkumar25.github.io/>

- Static **HTML5 / CSS3 / vanilla JavaScript**. No framework, no build step, no dependencies.
- Deploys to **GitHub Pages** by pushing the files.
- **The PDF is printed from the website itself**, so the document and the site can never say different things.

---

## Contents

1. [How it is put together](#1-how-it-is-put-together)
2. [Project structure](#2-project-structure)
3. [Running it locally](#3-running-it-locally)
4. [The downloadable PDF — read this before editing](#4-the-downloadable-pdf--read-this-before-editing)
5. [Editing the content](#5-editing-the-content)
6. [Deploying to GitHub Pages](#6-deploying-to-github-pages)
7. [Design system](#7-design-system)
8. [Accessibility and browser support](#8-accessibility-and-browser-support)
9. [Known gaps](#9-known-gaps)

---

## 1. How it is put together

One page, twelve sections, one stylesheet, one script.

| Layer      | File              | Responsibility                                                              |
| ---------- | ----------------- | ---------------------------------------------------------------------------- |
| Content    | `index.html`      | Every word on the site **and** in the PDF.                                   |
| Screen     | `css/style.css`   | Design tokens, layout, dark/light themes, components, responsive rules.      |
| Print      | `css/print.css`   | Turns the same page into an A4 document. Loaded with `media="print"` only.   |
| Behaviour  | `js/script.js`    | Theme toggle, mobile nav, scroll-spy, reveals, project dialogs, scroll UI.   |

Sections: Hero · Professional Profile · Technical Skills · Selected Projects ·
Professional Experience · Research · Education · Certifications · Hackathons ·
Resume · Contact.

The three capstone projects each have a **View Details** button that opens a
native `<dialog>` with the full case study. Those dialogs are also printed into
the PDF as a "Project Detail" chapter, so nothing is hidden from a reader who
only has the document.

---

## 2. Project structure

```
Portfolio/
├── index.html                     # the whole site — all content lives here
├── 404.html                       # GitHub Pages error page
├── robots.txt                     # crawl rules + sitemap pointer
├── sitemap.xml                    # one URL; update lastmod when you publish
├── .gitignore
├── README.md                      # this file
│
├── css/
│   ├── style.css                  # screen design system
│   └── print.css                  # PDF layout (media="print")
│
├── js/
│   └── script.js                  # vanilla JS, no dependencies
│
├── scripts/
│   ├── build-pdf.ps1              # regenerate the portfolio PDF from index.html
│   └── serve.ps1                  # local preview server
│
└── assets/
    ├── icons/favicon.svg
    ├── images/                    # og-image.png, apple-touch-icon.png, qr-site.png
    └── documents/
        ├── resume.pdf             # authored separately (Word) — see §9
        ├── portfolio.pdf          # GENERATED — do not edit by hand
        └── legacy/                # the old hand-maintained PDF source, unused
```

---

## 3. Running it locally

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

Serves the folder at <http://localhost:8000> and opens a browser. `Ctrl+C` stops it.

Opening `index.html` directly from disk also works, but a server matches how
GitHub Pages actually serves the site.

---

## 4. The downloadable PDF — read this before editing

### The rule

> **Edit `index.html`, then run the build script. Never edit the PDF or keep a
> second copy of the content anywhere.**

The portfolio PDF used to be generated from a separate file that duplicated all
the content, which is why the site and the download drifted apart. That file is
now in `assets/documents/legacy/` and nothing uses it.

Today the PDF is printed from `index.html` through `css/print.css`. Same words,
same order, same facts — just paginated for A4.

### Regenerate it

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-pdf.ps1
```

The script:

1. Finds Chrome or Edge on your machine (no install needed — pass
   `-BrowserPath "C:\path\to\chrome.exe"` if it cannot).
2. Prints `index.html` to `assets/documents/portfolio.pdf` in headless mode.
3. **Refuses to pass silently** if the file was not actually rewritten, so you
   can never publish a stale PDF believing it was refreshed.
4. Bumps the `?v=` token on both download links in `index.html`, so a visitor
   who downloaded an older copy is not served it from browser cache.
5. Stamps the "last generated" date shown next to the download buttons.

Stay online during step 2 — the page pulls Inter and JetBrains Mono from Google
Fonts, and the PDF would otherwise use fallback fonts.

Add `-NoVersionBump` to generate the file without touching `index.html`.

### What the PDF looks like

An A4 document of roughly twenty pages: a cover page, then every section of the
site, then the three capstone case studies in full. Printed in an ink-friendly
light palette regardless of which theme the site is in, with the navigation,
buttons, hero diagram and the Resume section removed.

### Checklist after any content change

```
[ ] edit index.html
[ ] check it in the browser          scripts\serve.ps1
[ ] regenerate the PDF               scripts\build-pdf.ps1
[ ] open assets/documents/portfolio.pdf and skim it
[ ] commit index.html AND portfolio.pdf together
```

Committing the two together is what keeps them in step for visitors.

---

## 5. Editing the content

Everything is plain HTML with clear section comments — search `index.html` for
the banner you want:

| To change                  | Search for                                    |
| -------------------------- | --------------------------------------------- |
| Headline, role, intro      | `01 · HERO`                                   |
| About text, focus areas    | `02 · ABOUT`                                  |
| Skills categories          | `03 · ENGINEERING STACK`                      |
| Projects                   | `04 · SELECTED PROJECTS`                      |
| Capstone detail modals     | `PROJECT DETAIL DIALOGS`                      |
| Jobs and internships       | `05 · EXPERIENCE`                             |
| Education, certifications  | `07 · EDUCATION`, `08 · CERTIFICATIONS`       |
| Email, LinkedIn, GitHub    | `12 · CONTACT`                                |
| PDF cover page             | `PRINT COVER`                                 |

### Adding a project

Copy an existing `<article class="case case-capstone">` block, change the text,
and point its button at a new dialog:

```html
<button class="btn btn-ghost btn-sm" type="button" data-dialog="dlg-yourproject">
  View Details <span aria-hidden="true">→</span>
</button>
```

Then copy a `<dialog class="case-dialog" id="dlg-yourproject">` into the
`PROJECT DETAIL DIALOGS` block. The script wires any `data-dialog` button to the
matching dialog id automatically — there is nothing to register.

### Adding a skill

Add an `<li>` to the right `<ul class="tag-list">`. Categories are plain `<li>`
panels in `<ul class="stack-grid">`; the seventh one spans two columns via
`.stack-panel-wide`.

---

## 6. Deploying to GitHub Pages

The repository is `Nishitkumar25/nishitkumar25.github.io`, served from `main` / root.

```bash
git add -A
git commit -m "Update portfolio content and regenerate PDF"
git push
```

Pages rebuilds within a minute or so. If you ever move it to a project
repository (e.g. `/portfolio/`), the site still works — every asset path is
relative — but update the absolute URLs in `robots.txt`, `sitemap.xml`, the
`og:url` meta tag and the PDF cover block.

---

## 7. Design system

The theme is **Enterprise Slate** — slate neutrals with an electric blue accent,
light-first with a full dark mode. All tokens sit at the top of `css/style.css`.
Change one value and it updates the whole site *and* the PDF.

`:root` carries the light palette; `:root[data-theme="dark"]` overrides it.
There are no per-component theme overrides anywhere — **every theme-dependent
value in the stylesheet is a token**, including the hero grid, the dialog
backdrop, shadows and the resume watermark. That is what makes a future palette
swap a ten-line edit rather than a hunt through 1,800 lines.

| Token | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--accent` | `#2563eb` | `#60a5fa` | Primary accent |
| `--accent-hover` | `#1d4ed8` | `#93c5fd` | Hover state |
| `--bg` / `--bg-card` / `--bg-sunken` | `#f7f9fc` / `#ffffff` / `#eef2f8` | `#0c1017` / `#141a25` / `#0a0e15` | Surface layers |
| `--text` / `--text-2` / `--text-3` | `#0f1b2d` / `#4a5a72` / `#76859a` | `#e8edf6` / `#a3b0c4` / `#6f7e94` | Primary, secondary, muted |
| `--line` / `--line-strong` | `#e2e8f1` / `#cbd5e3` | `#1e2634` / `#2c3749` | Borders |
| `--grid-line`, `--accent-wash`, `--rule-faint`, `--watermark`, `--backdrop`, `--header-bg`, `--inset-shadow` | — | — | Decorative surfaces |
| `--shadow-sm/md/lg`, `--edge-light` | — | — | Elevation |
| `--gutter` | `clamp(16px, 4vw, 28px)` | | Fluid page padding |
| `--sans` / `--mono` | Inter · JetBrains Mono | | Type |

**Default mode** follows the visitor's operating system
(`prefers-color-scheme`), falling back to light. The choice is stored in
`localStorage` under `nk-theme`, and an inline script in `<head>` applies it
before first paint, so there is no flash of the wrong theme.

`css/print.css` re-points these same tokens at paper values — that is the whole
trick behind the PDF matching the site.

### Responsiveness

The layout is intrinsically fluid rather than switching at a few fixed widths:

- Skills, project cards, case fields and dialog lists use
  `repeat(auto-fit, minmax(min(Npx, 100%), 1fr))`, so they reflow by available
  space, not by guessed breakpoints.
- Every heading and body size is a `clamp()` that interpolates with the viewport.
- The page gutter is fluid (`--gutter`).
- `@media (pointer: coarse)` raises every tap target to roughly 44px.
- Below 640px the project dialogs become full-height sheets with a sticky header.
- Verified: no horizontal scrolling at 320, 360, 380, 390, 414, 480, 540, 640,
  720, 768, 820, 900, 960, 1024, 1180, 1280, 1440, 1600 or 1920px.

## 8. Accessibility and browser support

- Semantic landmarks, real heading order, skip link, visible focus rings.
- Lists are real `<ul>`/`<li>`; nothing relies on ARIA to fake structure.
- Project modals use the native `<dialog>` element, so Escape, focus trapping
  and focus return are handled by the browser. Without JavaScript they render
  as ordinary panels — no content is ever unreachable.
- Every animation, hover lift and smooth scroll is disabled under
  `prefers-reduced-motion: reduce`.
- No horizontal scrolling at any width from 320px up.
- Text contrast meets WCAG AA in both themes (measured: 5.1:1 to 14.8:1 across
  body copy, muted text, headings, accent labels, tags, nav links and buttons).
- Tested in Chromium. Firefox and Safari have not been checked by hand.

---

## 9. Known gaps

| Gap                        | Detail                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `resume.pdf` is out of date | It is a Word document from September 2026. It does not mention Perficient or the Capstone 4 / 6 / 7 projects. Update it in Word and replace the file, or ask for a one-page resume to be generated from this site the way the portfolio PDF is. |
| No capstone repository links | None of the three capstone projects is a git repository locally, so no links are shown. Add them to the project cards once repositories exist. |
| No project screenshots      | There are no real screenshots in the capstone repositories, and none have been invented. Capture some and they can go into the detail modals. |
| `og-image.png`              | Still the pre-upgrade preview image used when the link is shared.                                                        |
| Certifications              | Only one is listed.                                                                                                      |
| `sitemap.xml`               | `lastmod` is set by hand — bump it when you publish a significant update.                                                |
