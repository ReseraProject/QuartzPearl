# QuartzPearl

QuartzPearl is a Discord bot for the Resera community. It is written in
TypeScript with [discord.js](https://discord.js.org/) and runs on
[Bun](https://bun.sh/).

## Commands

| Command                                                  | Description                                                               | Access          |
| -------------------------------------------------------- | ------------------------------------------------------------------------- | --------------- |
| `/ping`                                                  | Report response and Discord gateway latency.                              | Everyone        |
| `/about`                                                 | Introduce QuartzPearl and Resera.                                         | Everyone        |
| `/userinfo [target]`                                     | Show account, join, role, and presence details.                           | Everyone        |
| `/serverinfo`                                            | Show server members, channels, creation date, and boosts.                 | Everyone        |
| `/avatar [user]`                                         | Display a full-resolution avatar.                                         | Everyone        |
| `/poll question option_a option_b [option_c] [option_d]` | Create a persistent button poll.                                          | Everyone        |
| `/8ball question`                                        | Ask the magic 8-ball a question.                                          | Everyone        |
| `/roll [dice]`                                           | Roll dice notation such as `2d6+3`.                                       | Everyone        |
| `/coinflip`                                              | Flip a virtual coin.                                                      | Everyone        |
| `/purge amount [target]`                                 | Delete up to 100 recent messages.                                         | Manage Messages |
| `/admin-placeholder`                                     | Reserved administrator command.                                           | Administrator   |
| `/command-restrictions action [channel]`                 | Block, unblock, or list channels where regular users cannot run commands. | Administrator   |

Administrators bypass command-channel restrictions. Poll votes and per-server
channel restrictions are stored in `data/database.json`; the bot uses no SQL or
third-party database. JSON writes are serialized and replaced atomically.

## Requirements

- Bun 1.3 or newer
- A Discord application with a bot user

## Setup

1. Install dependencies:

   ```sh
   bun install
   ```

2. Copy `.env.example` to `.env` and fill in values from the
   [Discord Developer Portal](https://discord.com/developers/applications):

   ```env
   DISCORD_TOKEN=your-bot-token
   DISCORD_CLIENT_ID=your-application-id
   DISCORD_GUILD_ID=your-development-server-id
   ```

   `DISCORD_GUILD_ID` is optional. Keep it set during development for immediate
   command updates; remove it when you are ready to register commands globally.

3. On the application's **Bot** page, enable the **Server Members Intent** and
   **Presence Intent**. They allow `/userinfo` to show member and status data.
   QuartzPearl does not require Message Content Intent.

4. Invite the bot with the `bot` and `applications.commands` scopes. Grant it
   View Channels, Send Messages, Embed Links, Read Message History, and Manage
   Messages where `/purge` should work.

5. Register the slash commands and start the bot:

   ```sh
   bun run register
   bun run dev
   ```

## Development

```sh
bun run check       # Type-check and test
bun run start       # Run once
bun run dev         # Restart when source files change
bun run register    # Publish slash-command definitions
```

Add commands under `src/commands/`, export them from `src/commands/index.ts`,
then run `bun run register` again.

Runtime data is intentionally ignored by Git. Back up `data/database.json` when
moving the bot to a different host.

## License

QuartzPearl is licensed under GPL-2.0-only. See [LICENSE](LICENSE).
