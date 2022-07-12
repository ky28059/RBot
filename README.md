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
parsed to an `argParser` pattern via the factory function.
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

### Parsing
Responsible for parsing command arguments, `argParser.ts` (inspired by HarVM's simpleArgumentParser) determines how to 
parse text arguments based on a custom string-based pattern syntax. The full documentation for said syntax is as follows:

| Pattern    | Type                                                    |
|------------|---------------------------------------------------------|
| `[field]`  | Singular string.                                        |
| `(field)`  | Singular integer.                                       |
| `@[field]` | Singular `User`. Resolves both mentions and raw IDs.    |
| `#[field]` | Singular `Channel`. Resolves both mentions and raw IDs. |
| `&[field]` | Singular `Role`. Resolves both mentions and raw IDs.    |
| `<field>`  | The rest of the `argString`.                            |

| Pattern        | Modifier                                                                                                                                                          |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `[field]?`     | Optionality. The field will be matched if it exists, or will be `undefined` if it doesn't. Unlike required fields, no error will be thrown if nothing is matched. |
| `[...field]`   | Repeating. The rest of the given arguments will be matched as this field, and the match will be returned as an array.                                             |
| `(field)[a-b]` | (for integer fields) Range. The field will only match if the argument lies within the inclusive range from `a` to `b`, and an error will be thrown otherwise.     |

For the confused, here's some examples of patterns and what they match:

| Pattern               | Arguments   | Parsed                                  |
|-----------------------|-------------|-----------------------------------------|
| `[message]`           | `hello`     | `{message: 'hello'}`                    |
| `(message)`           | `hello`     | IntegerConversionError                  |
| `[action] &[role]`    | `add @role` | `{action: 'add', role: Role}`           |
| `(count) @[target]?`  | `100 @user` | `{count: 100, target: User}`            |
| `(count) @[target]?`  | `100`       | `{count: 100}`                          |
| `[initial] [...args]` | `a b c d`   | `{initial: 'a', args: ['b', 'c', 'd']}` |
| `[initial] <args>`    | `a b c d`   | `{initial: 'a', args: 'b c d'}`         |
| `(days)[0-7]`         | `5`         | `{days: 5}`                             |
| `(days)[0-7]`         | `56`        | IntegerRangeError                       |

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
