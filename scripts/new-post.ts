import { NodeRuntime, NodeServices } from '@effect/platform-node';
import { Console, Effect, FileSystem } from 'effect';
import { Argument, CliError, Command } from 'effect/cli';
import { join } from 'node:path';

const titleArgument = Argument.String('title').pipe(
  Argument.withDescription('Post title, quoted when it contains spaces.'),
  Argument.withDefault('Untitled post'),
);

const command = Command.make('new:post', { title: titleArgument }, ({ title: input }) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const title = input.trim();
    const slug = title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
    if (!slug) {
      return yield* Effect.fail(new Error('The title must contain at least one letter or number.'));
    }

    const directory = join('src', 'content', 'blog');
    const path = join(directory, `${slug}.md`);
    // Markdown and MDX filenames share the same collection ID.
    for (const extension of ['md', 'mdx']) {
      const existing = join(directory, `${slug}.${extension}`);
      if (yield* fs.exists(existing)) {
        return yield* Effect.fail(new Error(`Post already exists: ${existing}`));
      }
    }

    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')].join('-');
    const content = [
      '---',
      `title: ${JSON.stringify(title)}`,
      'description: ""',
      `pubDate: "${date}"`,
      `# updatedDate: "${date}"`,
      '# heroImage: "../../assets/your-image.jpg"',
      '---',
      '',
      '',
    ].join('\n');

    yield* fs.makeDirectory(directory, { recursive: true });
    // Exclusive creation also protects against concurrent runs for the same title.
    yield* fs.writeFileString(path, content, { flag: 'wx' });
    yield* Console.log(`Created ${path}`);
  }).pipe(Effect.mapError((error) => new CliError.UserError({
    cause: error,
    userMessage: error.message,
  }))),
).pipe(Command.withDescription('Create a blank blog entry with the required frontmatter.'));

command.pipe(
  Command.run({ version: '0.0.1' }),
  Effect.provide(NodeServices.layer),
  NodeRuntime.runMain({ disableErrorReporting: true }),
);
