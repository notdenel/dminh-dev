## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Tailwind v4 does not generate classes from a source file created *after* the dev
server started. Those utilities silently no-op while classes already used elsewhere
keep working, so the page renders half-styled with no error in the build or the
console. Restart the dev server after adding a page or component. Decimals in
arbitrary values (`grid-cols-[5.5rem_1fr]`) are not the problem — verified against
a build.

## Versioning

Tags mark design milestones only. Three-digit `vMAJOR.MINOR.PATCH`, annotated,
never the trailing-`.0`-dropped form. No patch tags: `main` deploys continuously,
so every push is already the release, and a tag nobody rolls back to is noise —
tag one retroactively if a specific patch ever needs naming.

No GitHub Releases. There is no artifact to distribute, and hand-written notes go
stale (v0.1.2 and v0.1.3 were tagged and never released, which is what retired the
practice). Bump `package.json` only when cutting a tag, so its version always
equals the latest tag.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
