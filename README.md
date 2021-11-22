# RBot
Unreliable Discord moderator bot, built using Discord.js 13 and Node 16!
 
#### Invite Link:
https://discord.com/oauth2/authorize?client_id=684587440777986090&scope=bot+applications.commands&permissions=8

# Additional Info
 
### Folder Structure:
Sharding is handled by `index.ts` while the logic to run the bot is handled by `bot.ts`. Note that because `ts` files 
cannot currently be sharded by discord.js's `ShardingManager` interface, sharding is currently broken.

Utilities specifically used by `bot.ts` are in /utils.
 
The commands that RBot uses can be located in /commands, and are organized into several subgroups:
 
- /commands/admin: Basic moderator commands; purge, kick, ban, etc.
 
- /commands/normal: Random fun commands anyone can use; avatar, say, gild, etc.
 
- /commands/presets: More advanced server settings stuff; modlog, command disabling, etc.
 
- /commands/music: Music bot commands; play, loop, die, etc.
 
- /commands/owner: Owner only commands, usually for testing; emit, reload, etc.
 
- /commands/utils: Aren't actually commands, but instead helper functions other commands rely on.
  
### Running RBot on your machine:
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

After doing those things, `npm run withoutSharding` should start the bot without sharding.

### Creating your own discord bot:
Below is a list of some resources I found very helpful for beginners who want to create their own discord bots.
 
| Name | Description |
| ----------- | ----------- |
| [discord.js documentation](https://discord.js.org/#/docs/main/stable/general/welcome) | The documentation for discord.js. |
| [discord.js guide](https://discordjs.guide/) | A guide that starts from the basics and covers almost everything needed to create an efficient, functioning bot. |
| [`@discordjs/voice` example TS music bot](https://github.com/discordjs/voice/tree/main/examples/music-bot) | An example TypeScript bot showing how to use the new `@discordjs/voice` interface that came with djs 13. |
