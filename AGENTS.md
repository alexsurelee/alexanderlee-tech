## Development

We practice true continuous integration: work directly on `main`, commit small
changes frequently, and push straight to `main` after the required checks pass.
Do not create feature branches or use a pull request workflow.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Run `pnpm typecheck` after code or configuration changes as part of the development
loop, and fix reported errors before considering the work complete. This checks
Astro components and TypeScript files, including the Storybook configuration.

When WebStorm IDE tools are available, inspect diagnostics for changed code and
configuration files before considering the work complete. For reported editor
errors, query the affected file's IDE diagnostics first instead of assuming the
issue is IDE-only. Use the JetBrains IDE tool's `get_file_problems` command with
`--filePath <project-relative-path>`. Keep `pnpm typecheck` as the project-wide
check; IDE diagnostics complement it. If IDE tools are unavailable, continue with
the CLI check and state that IDE diagnostics could not be verified.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
