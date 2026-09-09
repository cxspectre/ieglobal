# Veyago credit

A small, reusable "Made by Veyago Inc." badge for the footer of any website. Icon plus link to https://www.veyago.cloud. Inherits the surrounding text colour, so it works on dark and light footers without extra styling.

## Files

| File | Use it when |
|------|-------------|
| `VeyagoCredit.tsx` | The site is React (Next.js, Remix, Vite, CRA). Zero dependencies. |
| `veyago-credit.html` | The site is plain HTML, WordPress, Webflow, etc. Open it in a browser to see the demo, then copy the marked block. |
| `veyago-icon.png` | 1024 px source icon. |
| `veyago-icon-96.png` | 96 px icon, plenty for a 22 px badge on retina screens. |

## React / Next.js

Copy `VeyagoCredit.tsx` into your components folder.

```tsx
import { VeyagoCredit } from './VeyagoCredit';

<VeyagoCredit />                              // "Made by [icon] Veyago Inc."
<VeyagoCredit label="Erstellt von" />         // translated label
<VeyagoCredit iconSrc="/veyago-icon.png" />   // self-hosted icon (copy veyago-icon-96.png into public/)
```

Props:

| Prop | Default | Notes |
|------|---------|-------|
| `label` | `"Made by"` | Text before the icon. Pass a translated string. |
| `name` | `"Veyago Inc."` | Text after the icon. |
| `href` | `https://www.veyago.cloud` | Link target. |
| `iconSrc` | `https://www.veyago.cloud/assets/veyago-icon.png` | Use a local copy to avoid an external request. |
| `size` | `22` | Icon size in px. |
| `newTab` | `true` | Adds `target="_blank"` and `rel="noopener noreferrer"`. |
| `className`, `style` | | Extra styling on the link. |

The link uses `color: inherit`. To change the hover colour with a utility class, wrap it: `<span className="hover:text-white"><VeyagoCredit /></span>`.

## Plain HTML

Paste into the footer, then add the three CSS rules once.

```html
<a class="veyago-credit" href="https://www.veyago.cloud" target="_blank" rel="noopener noreferrer" aria-label="Made by Veyago Inc.">
  <span>Made by</span>
  <img src="https://www.veyago.cloud/assets/veyago-icon.png" alt="" width="22" height="22" loading="lazy">
  <span class="veyago-credit__name">Veyago Inc.</span>
</a>
```

```css
.veyago-credit { display: inline-flex; align-items: center; gap: .5em; color: inherit; text-decoration: none; font: inherit; }
.veyago-credit img { width: 22px; height: 22px; border-radius: 6px; box-shadow: 0 0 0 1px rgba(255,255,255,.15); flex-shrink: 0; }
.veyago-credit__name { font-weight: 600; }
```

`veyago-credit.html` also contains a variant with the icon embedded as a data URI, for pages that must not make external requests.

## Used in

- ie-global.net footer, via `components/ui/VeyagoCredit.tsx`, which only adds the translated label.
