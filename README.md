# dminh.dev

my personal site. a blog, a few projects, and whatever i'm currently up to.

live at [dminh.dev](https://dminh.dev).

## built with

- [astro](https://astro.build) — static pages, plus one server route for the spotify line
- [tailwind](https://tailwindcss.com) v4 — every colour, size and spacing step is a token in `src/styles/global.css`
- markdown content collections for the posts and projects
- hosted on vercel

## running it

```sh
npm install
npm run dev
```

`npm run build` to build, `npm run check` for types, `npm test` for the unit tests.

the now-playing line needs spotify credentials in a `.env`. without them it just doesn't render.

## note

this is my site, not a template. read the code if it's useful to you, but the writing and the design are mine.
