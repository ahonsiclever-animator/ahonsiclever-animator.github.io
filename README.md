# Ahonsi Clever — portfolio site

Plain HTML/CSS/JS. No build step. Fonts: Bricolage Grotesque (headings) + Be Vietnam Pro (text), from Google Fonts.

## Pages
- `index.html` — home: hero, what I do, Burdens in Babylon case study, selected work, process, toolkit, contact
- `work.html` — every piece, with filters and a full-screen viewer
- `about.html` — bio, experience, education (from the CV)

## Remove pieces you don't want
1. Double-click **Manage portfolio.bat**. The site opens in Edit mode at http://127.0.0.1:8803
2. Every card and panel tile has a **Remove** button. In the full-screen viewer you can remove one clip or the whole project.
3. **Removed (n)** at the bottom lists what you took off. **Restore** puts it back. **Delete files** removes its videos from `media/` for good, so they aren't uploaded.

Your choices are saved in `js/hidden.js`. Press **Publish** in the bottom bar to push them to the live site
(https://ahonsiclever-animator.github.io/). It updates in about a minute.

## Change text or add work
- Titles, captions and categories: `js/works.js`
- New clips: add a line to `tools/clips.json` (`[id, path inside CLEVERS FARM, poster position 0-1]`), then run
  `python tools/encode.py <id>` and `python tools/build_meta.py`. The encoder runs one file at a time at low priority.
- Hand-placed pieces on the home page are the `data-slot="..."` tags in `index.html`.

## Online
Hosted on GitHub Pages from the `gh-pages` branch of github.com/ahonsiclever-animator/ahonsiclever-animator.github.io (organization owned by ahonsiclever-maker).
`tools/` stays on this laptop (it's in .gitignore). Any other change: open Edit mode and press Publish.
