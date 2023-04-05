# RBot
A generic Discord moderator bot, built using Node.js, TypeScript, and Discord.js 14!

#### Invite link:
https://discord.com/oauth2/authorize?client_id=684587440777986090&scope=bot+applications.commands&permissions=8

### Folder structure
`bot.ts` is the main program file, run by `npm start` to start the bot. To register new slash commands, use 
`npm run registerSlashCommands`; see **Commands** for how RBot's dynamic command parsing works. 

Utilities used by `bot.ts` and other commands are in `/util`.

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
`./util/parseCommands`, but essentially a slash-command supporting command file exports a `data` property which contains
the `SlashCommandBuilder` representing the command's application data. This data is used for command registration and 
used when backporting the command to allow text-based invocations.

The command itself uses one of two factory functions to standardize the created command format across text and slash 
commands.
```ts
// text-command.ts

export default createTextCommand({
    name: 'example',
    description: 'An example command',
    // ...
    async execute(message) {
        // message: Message
    }
});
```
```ts
// slash-command.ts

export const data = new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command')

export default createSlashCommand({
    data,
    // ...
    async execute(message) {
        // message: Message | CommandInteraction
    }
});
```
The main body of a command is its `async execute()` method, which takes in the `Message` (or, if supporting slash commands,
`Message | CommandInteraction`) and the command's parsed arguments and executes the command. Thrown errors (like when 
input is malformed) are caught in `bot.ts` and sent in discord as error embeds.

For text-based commands, arguments are specified by providing a `pattern` field in the command data specifying a parser
pattern (see **Parsing**). For type safety, the parsed object type must be passed to the factory function as a generic.
```ts
// example.ts

export default createTextCommand<{ name: string, user?: User }>({
    name: 'example',
    description: 'An example command',
    pattern: '[name] @[user]?',
    // ...
    async execute(message, parsed) {
        // parsed: {name: string, user?: User}
    }
});
```

For slash commands, using the `SlashCommandBuilder`'s `.addStringOption`, `.addUserOption`, etc. methods will be automatically 
parsed to an `argParser` pattern by the factory function.
```ts
// example.ts

export const data = new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command')
    .addStringOption(option => option
        .setName('name')
        .setRequired(true))
    .addUserOption(option => option
        .setName('user'))

export default createSlashCommand<{ name: string, user?: User }>({
    data,
    // ...
    async execute(message, parsed) {
        // parsed: {name: string, user?: User}
    }
});
```

To create guild-only commands, use the `createGuildOnlySlashCommand()` and `createGuildOnlyTextCommand()` factory functions.
Guild-only commands can only be used within servers, but allows you to set permission requirements and safely access the
SQL server presets.

When creating a guild-only slash command, remember to call `.setDMPermission(false)` on the slash command builder, or the
registered slash command won't be guild-only.
```ts
// purge.ts

export const data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk deletes the specified amount of messages in the channel, or only messages sent by a given user.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option
        .setName('count')
        .setDescription('The number of messages to purge.')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))

export default createGuildOnlySlashCommand<{count: number}>({
    data,
    // ...
    async execute(message, parsed, tag) {
        // tag: GuildPresets
    }
});
```

To add autocomplete to a slash command option, export an async function to handle the autocomplete interaction. `async handleAutocomplete()`
takes two arguments -- the `AutocompleteInteraction` and `Tag` -- and responds to the interaction with the autocomplete 
options.

Remember to call `.setAutocomplete(true)` on all options you wish to receive `AutocompleteInteraction`s for.
```ts
// help.ts

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Gets info about a command, or sends a command list.')
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to get info about.')
        .setAutocomplete(true))

export default createSlashCommand<{command?: string}>({
    data,
    // ...
    async execute(message, parsed, tag) {
        // ...
    },
    async handleAutocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const choices = [...interaction.client.commands.keys()]
            .filter(command => command.startsWith(focused.toString()))
            .slice(0, 25)
        await interaction.respond(choices.map(command => ({name: command, value: command})));
    }
});
```

### Parsing
Responsible for parsing command arguments, `argParser.ts` (inspired by HarVM's simpleArgumentParser) determines how to 
parse text arguments based on a custom string-based pattern syntax. The full documentation for said syntax is as follows:

| Pattern    | Type                                                                                                                                                                                                                                                                    | Corresponds to (slash commands) |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| `[field]`  | Singular string.                                                                                                                                                                                                                                                        | `.addStringOption()`            |
| `(field)`  | Singular integer.                                                                                                                                                                                                                                                       | `.addIntegerOption()`           |
| `@[field]` | Singular `User`. Resolves both mentions and raw IDs.                                                                                                                                                                                                                    | `.addUserOption()`              |
| `#[field]` | Singular `Channel`. Resolves both mentions and raw IDs.                                                                                                                                                                                                                 | `.addChannelOption()`           |
| `&[field]` | Singular `Role`. Resolves both mentions and raw IDs.                                                                                                                                                                                                                    | `.addRoleOption()`              |
| `:[field]` | Singular `GuildEmoji`. Resolves both emojis and raw IDs.                                                                                                                                                                                                                |                                 |
| `{field}`  | Singular duration. Supports days, hours, minutes, and seconds. Must specify units in descending length, but can be specified as long form ("3 days 2 hours") or shorthand ("3d2h"). Returned as a `number` representing milliseconds. See `argParser` for more details. |                                 |
| `<field>`  | The raw rest of the `argString`.                                                                                                                                                                                                                                        |                                 |

| Pattern        | Modifier                                                                                                                                                          | Corresponds to (slash commands)    |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| `[field]?`     | Optionality. The field will be matched if it exists, or will be `undefined` if it doesn't. Unlike required fields, no error will be thrown if nothing is matched. | `.setRequired(false)` (default)    |
| `[...field]`   | Repeating. The rest of the given arguments will be matched as this field, and the match will be returned as an array.                                             |                                    |
| `(field)[a-b]` | (for integer fields) Range. The field will only match if the argument lies within the inclusive range from `a` to `b`, and an error will be thrown otherwise.     | `.setMinValue()`, `.setMaxValue()` |

For types that do not have a slash command equivalent, if slash command support is needed, use `.addStringOption()` and
manually parse it within the command body with the corresponding `parseTypeArg()` function from `argParser`. Though this
doesn't correctly represent the argument type in the `pattern` for `/help`, it achieves the same functionality.

Here's some examples of patterns and what they match:

| Pattern               | Arguments       | Parsed                                  |
|-----------------------|-----------------|-----------------------------------------|
| `[message]`           | `hello`         | `{message: 'hello'}`                    |
| `[message]`           | `"hello world"` | `{message: 'hello world'}`              |
| `(message)`           | `hello`         | IntegerConversionError                  |
| `[action] &[role]`    | `add @role`     | `{action: 'add', role: Role}`           |
| `(count) @[target]?`  | `100 @user`     | `{count: 100, target: User}`            |
| `(count) @[target]?`  | `100`           | `{count: 100}`                          |
| `[initial] [...args]` | `a b c d`       | `{initial: 'a', args: ['b', 'c', 'd']}` |
| `[initial] [...args]` | `a b "c d"`     | `{initial: 'a', args: ['b', 'c d']}`    |
| `[initial] <args>`    | `a b c d`       | `{initial: 'a', args: 'b c d'}`         |
| `[initial] <args>`    | `a b "c d"`     | `{initial: 'a', args: 'b "c d"'}`       |
| `(days)[0-7]`         | `5`             | `{days: 5}`                             |
| `(days)[0-7]`         | `56`            | IntegerRangeError                       |
| `@[user] {time}`      | `@user "3m 2s"` | `{user: User, time: 182000}`            |

### Running RBot locally
While most files RBot uses are committed directly to GitHub, there are a few things you need to do before being able to 
run RBot on your own. Note that you need to install a version of Node >= 16 for discord.js 13 to run.

- Install the node.js dependencies with `npm install`.

- Create a config file named `auth.ts` in the root folder that exports your discord bot token ([obtained here](https://discord.com/developers/applications))
  and discord user ID. The resulting file should look something like this:
```js
export const token = 'discord_token_here';
export const ownerId = '000000000000000000';
```

With all dependencies installed, `npm start` should start the bot program.
