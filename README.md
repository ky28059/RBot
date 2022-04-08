# RBot
An unreliable Discord moderator bot, built using Discord.js 13 and Node 16!

#### Invite link:
https://discord.com/oauth2/authorize?client_id=684587440777986090&scope=bot+applications.commands&permissions=8

### Folder structure
`bot.ts` is the main program file, run by `npm start` to start the bot. To register new slash commands, use 
`npm run registerSlashCommands`; see **Commands** for how RBot's dynamic command parsing works. 

Utilities used by `bot.ts` and other commands are in `/utils`.

RBot's commands are located in `/commands`, and are currently organized into 5 submodules:
- `/commands/admin`: Basic moderator commands; purge, kick, ban, etc.
- `/commands/normal`: Random fun commands anyone can use; avatar, say, gild, etc.
- `/commands/presets`: More advanced server settings stuff; modlog, command disabling, etc.
- `/commands/music`: Music bot commands; play, loop, die, etc.
- `/commands/owner`: Owner only commands, usually for testing; emit, reload, etc.

See **Commands** for how RBot parses the contents of `/commands` and how to add commands or submodules.

### Commands
RBot dynamically parses all folders inside `/commands` as submodules. Within each submodule, every `.ts` file is parsed
as a command.

Commands come in two formats: slash command supporting and text-only. The detailed types for these can be found in 
`./util/parseCommands`, but essentially a slash-command supporting command file will have a `data` property which exports
the `SlashCommandBuilder` representing the command's application data, which is used for command registration and then 
parsed to be compatible with text-based invocations.
```ts
// Slash command
export default {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('An example command'),
    // ...
    async execute(message: Message | CommandInteraction) {
        // ...
    }
}
```
```ts
// Text-only command
export default {
    name: 'example',
    description: 'An example command',
    // ...
    async execute(message: Message) {
        // ...
    }
}
```
The main body of a command is its `async execute()` method, which takes in the `Message` (or, if supporting slash commands,
the `CommandInteraction`) and an object representing the command's parsed arguments and executes logic based on the
provided input. Thrown errors (like when input is malformed) are caught in `bot.ts` and displayed as error embeds.

For text-based commands, arguments are specified by providing a `pattern` field in the command data specifying a parser
pattern. The syntax for RBot's argParser pattern can be found in `./util/argParser`.
```ts
export default {
    name: 'example',
    description: 'An example command',
    pattern: '[name] @[...users]',
    // ...
    async execute(message: Message, parsed: {name: string, users: User[]}) {
        // ...
    }
}
```
For slash commands, using the `SlashCommandBuilder`'s `.addStringOption`, `addUserOption`, etc. will be automatically 
parsed to an argParser pattern at startup.

### Running RBot locally
While most files RBot uses are committed directly to GitHub, there are a few things you need to do before being able to 
run RBot on your own. Note that you need to install a version of Node >= 16 for discord.js 13 to run.

- Install the node.js dependencies with `npm install`.

- Create a config file named `auth.ts` in the root folder that exports your discord bot token ([obtained here](https://discord.com/developers/applications)). 
  The resulting file should look something like this:
 ```js
 export const token = 'discord_token_here';
 ```
- Update the owner id in `bot.ts` with your own Discord ID. Though this step isn't *strictly* necessary (nothing will break 
  if you skip this), without updating the id you will not be able to use owner only commands and DM forwarding.

After doing those things, `npm start` should start the bot program.
