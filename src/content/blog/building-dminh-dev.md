---
title: "Building dminh.dev"
description: "Notes on building my personal site with Astro, Tailwind CSS, Markdown, and Vercel"
pubDate: 2026-07-10
tags:
  - technical
  - learning
draft: true
---

this is a draft post about building the site.

things i might write about:

- why i chose astro
- how the site structure changed over time
- what i wanted the design to feel like
- how markdown/content collections fit into the workflow
- what i learned from building instead of using a template

## testing media styles

![Screenshot of the homepage.](./images/happycat.png)

_example caption text_

> this is a normal blockquote.

<aside class="callout callout-note">
  <p class="callout-title">note</p>
  <p>this is a custom callout using raw HTML inside markdown</p>
</aside>

here is some `inline code`.

```bash
npm run build
npm run preview
```

### i might try to make this nicer with MDX later

but we're like, 80% of the way there

```text
Figure.astro
Callout.astro
MDX support
```

<Callout type="note" title="note">
  this is much cleaner than raw HTML
</Callout>
