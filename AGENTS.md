## Development

Use TypeScript for new code, configuration, scripts, and tests. Do not introduce
JavaScript files.

Use pnpm for dependency management and project commands. Use `pnpm install` to
install dependencies, `pnpm <script>` to run package scripts, and `pnpm exec <tool>`
for local binaries. Keep `pnpm-lock.yaml` updated when dependencies change; do not
introduce lockfiles from other package managers.

We practice true continuous integration: work directly on `main` and commit small
changes frequently. Do not create feature branches or use a pull request workflow.

Push straight to `main` after the required checks pass. By default, ask before
pushing unless the user has explicitly authorized pushing the current changes.
Use pragmatic judgment: small, low-risk documentation updates, formatting changes,
and tiny bug fixes may be pushed automatically. Keep this exception narrow; ask
before pushing broader changes, features, or changes with meaningful risk or
user-visible impact. Do not bundle changes requiring approval into an automatic
push. Continuous integration and permission to edit or commit do not otherwise
imply permission to push, and authorization for one push does not carry over to
subsequent pushes.

When starting the dev server, use background mode:

```
pnpm astro dev --background
```

Manage the background server with `pnpm astro dev stop`, `pnpm astro dev status`, and `pnpm astro dev logs`.

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
