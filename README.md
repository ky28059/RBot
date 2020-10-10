# RBot
 Unreliable Discord moderator bot, built using Discord.js and Node 14!
 
#### Invite Link:
 https://discord.com/oauth2/authorize?client_id=684587440777986090&scope=bot&permissions=8


# Additional Info
 
### Folder Structure:
 The main file that runs the bot, bot.js, can be located in the root folder.

 The commands that RBot uses can be located in /commands, and are organized into 4 groups:
 
 - /commands/admin: Basic moderator commands; purge, kick, ban, etc.
 
 - /commands/normal: Random fun commands anyone can use; avatar, say, gild, etc.
 
 - /commands/token: More advanced server settings stuff; modlog, command disabling, etc.
 
 - /commands/music: Music bot commands; play, loop, die, etc.
 
 - /commands/utils: Aren't actually commands, but instead helper functions other commands rely on.
 
 /tokens is the directory where RBot stores server preferences (in the form of json tokens) in.
 
### Running RBot on your machine:
 While most files RBot uses are committed directly to Github, there are 2 major things you need to do before being able to run RBot on your own.
 
 1. Install the node.js dependencies with `npm install`
 
 2. Create a file named "auth.js" (js because importing from json in Node 14 is weird) in the root folder that exports both your discord bot token ([obtained here](https://discord.com/developers/applications)) and Youtube API key ([follow instructions here](https://developers.google.com/youtube/v3/getting-started)). The resulting file should look something like this:
 ```js
 export const token = 'discord_token_here';
 export const youtubeAPIKey = 'youtube_API_key_here';
 ```
After doing those two things, you should be able to `node bot.js` in the commandline and run the bot!

### Creating your own discord bot:
 Below is a list of some resources I found very helpful for beginners who want to create their own discord bots.
 
 | Resource Name | Description |
 | ----------- | ----------- |
 | [Official discord.js guide](https://discordjs.guide/) | A neat guide that starts from the basics and covers almost everything you need to know for an efficient, functioning bot |
 | [discord.js documentation](https://discord.js.org/#/docs/main/stable/general/welcome) | Semi-self explanatory, the documentation for discord.js |
 | https://github.com/eritislami/evobot/ | A neat MIT licensed example of a music bot |