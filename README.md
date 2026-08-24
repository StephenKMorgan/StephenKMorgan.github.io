# stephenkmorgan.github.io

Personal site for Stephen K. Morgan — [stephenkmorgan.github.io](https://stephenkmorgan.github.io/)

A single-page professional profile with a soft-neumorphic design system.
Hand-written HTML, CSS, and vanilla JavaScript: **no framework, no build step,
no dependencies.** GitHub Pages serves the files exactly as they are committed.

## Layout

```
index.html               all content and markup
assets/css/style.css     design tokens + neumorphic component system
assets/js/main.js        theme toggle, scroll-spy, mobile nav, reveal-on-scroll
assets/fonts/            Inter (self-hosted variable font, latin subsets)
assets/img/              favicon + Open Graph card
```

## Editing

All copy lives directly in `index.html` — edit the markup, commit, and push.
Sections still carrying placeholder text are marked with `TODO(Stephen)`
comments:

```sh
grep -n "TODO(Stephen)" index.html
```

Colors, depth, and radii are CSS custom properties at the top of `style.css`.
Changing `--accent` recolors the whole site; the `--d-*` / `--b-*` tokens
control how far surfaces sit above and below the page.

## Design notes

The rule the stylesheet follows is **depth is decorative, contrast is not.**
Neumorphic shadows carry affordance only — every piece of text uses an
independently contrast-checked color token, and focus states draw a real
outline ring rather than relying on the shadow effect. This is what keeps the
style from becoming the accessibility problem it usually is.

## Running locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

There is nothing to install or compile.
