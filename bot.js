// TODO: add in .catch()s so that the bot wont break as much
// TODO: add in catchs on commands that require token information to check for if a token is lacking the field that command requires (currently only have checks for if a server is missing a token)
import Discord from 'discord.js';
import fs from 'fs';
import {token} from './auth.js';
import {writeFile, readFile} from './fileManager.js';
import {readToken} from './commands/utils/tokenManager.js';
import * as commands from './commands/commands.js';

const client = new Discord.Client();
const talkedRecently = new Set();

// Initialize Discord Bot
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await client.user.setActivity('!help', { type: "LISTENING" });
});

client.on("guildCreate", async guild => { // does !update upon joining new server
  const exTokenContents = await readFile('./tokens/example.json');
  const exTokenData = JSON.parse(exTokenContents); // my variable names are so horrible

  let tokenData = await readToken(guild);
  const tokenDataKeys = Object.keys(tokenData);
  const exTokenDataKeys = Object.keys(exTokenData);

  const path = `./tokens/${guild.id}.json`;

  if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
    writeFile(path, exTokenContents)
    console.log(`Token generated for ${guild.name}`);

  } else if (JSON.stringify(tokenDataKeys) !== JSON.stringify(exTokenDataKeys)) {
    tokenData = { ...exTokenData, ...tokenData}; // credit to Sean for this fantastically simple but amazing code
    writeFile(path, JSON.stringify(tokenData));
    console.log(`Token updated for ${guild.name}`); // maybe add in fields so that people know exactly which fields were updated? seems super complicated tho

  }
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  if (message.channel.type === 'dm') { // DM forwarding
    const dmEmbed = new Discord.MessageEmbed()
      .setColor(0x7f0000)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setDescription(`**${message.author} DMed RBot this message:**\n${message.content}`)
      .setFooter(`${new Date()}`);
    await client.users.cache.get('355534246439419904').send(dmEmbed);
    return;
  }

  if (talkedRecently.has(message.author.id)) return; // Spam prevention

  // maybe move this code elsewhere? idk
  const guild = message.guild;
  const member = guild.member(message.author);

  const tokenData = await readToken(guild);
  const prefix = tokenData.prefix || '!'; // maybe move somewhere else?

  if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id) && !member.hasPermission('ADMINISTRATOR')) {
    const censoredEmbed = new Discord.MessageEmbed()
      .setColor(0x7f0000)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setDescription(`**Message by ${message.author} censored in ${message.channel}:**\n${message.content}`)
      .setFooter(`${new Date()}`);
    if (tokenData.logchannel) {
      client.channels.cache.get(tokenData.logchannel).send(censoredEmbed).catch(error => console.error(`censoredMessage in ${guild} could not be logged because of ${error}!`));
    }
    await message.delete()
      .catch(error => console.error(`message in ${guild} could not be censored because of ${error}!`));
    return;
  }

  if (message.content.substring(0, prefix.length) === prefix) {
    const args = message.content.slice(prefix.length).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array

    const command = args.shift().toLowerCase(); // removes the command from the args array
    if (tokenData.disabledcommands && tokenData.disabledcommands.includes(command)) return; //command disabling

    const snowflakes = args.filter(arg => Number(arg));

    const userTarget = message.mentions.users.first() || client.users.cache.get(snowflakes[0]) || client.users.cache.find(user => user.username === args[0]);
    const memberTarget = message.mentions.members.first() || guild.members.cache.get(snowflakes[0]) || guild.members.cache.find(member => member.user.username === args[0]);
    const channelTarget = message.mentions.channels.first() || client.channels.cache.get(snowflakes[0]);
    const roleTarget = message.mentions.roles.first() || guild.roles.cache.get(snowflakes[0]);

    const path = `./tokens/${guild.id}.json`; // needed for existssync

    // Commands
    switch (command) {
      case 'ping':
        commands.ping(message, client);
        break;

      case 'say':
        commands.say(message, args.join(' '));
        break;

      case 'avatar':
        commands.avatar(message, userTarget);
        break;

      case 'profile':
        commands.profile(message, userTarget);
        break;

      case 'gild':
        commands.gild(message);
        break;

      case 'react':
        commands.react(message, args);
        break;

      case 'mcstatus':
        commands.mcstatus(message, args[0]);
        break;

      case 'help':
        commands.help(message);
        break;

      case 'update':
        commands.update(message);
        break;

      case 'set':
        const field = args.shift().toLowerCase();
        commands.set(message, field, args, client);
        break;

      case 'autorole':
        commands.autorole(message, args[0], roleTarget);
        break;

      case 'toggle':
        commands.toggle(message, args[0]);
        break;

      case 'disable':
        commands.disable(message, args[0], commands);
        break;

      case 'enable':
        commands.enable(message, args[0]);
        break;

      case 'presets':
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');
        commands.presets(message);
        break;

      case 'censor':
        commands.censor(message, userTarget);
        break;

      case 'uncensor':
        commands.uncensor(message, userTarget);
        break;

      case 'censored':
        commands.censored(message, client);
        break;

      case 'purge':
        commands.purge(message, args[0]);
        break;

      case 'expunge':
        commands.expunge(message, args[0]);
        break;

      case 'kick':
        commands.kick(message, memberTarget, args.join(' '), tokenData.logchannel, client);
        break;

      case 'ban':
        commands.ban(message, memberTarget, args.join(' '), tokenData.logchannel, client);
        break;

      case 'addemote':
        let name = args.slice(1).join('_'); // discord does not allow spaces or dashes in emoji names :(
        commands.addemote(message, guild, args[0], name);
        break;
    }

    // adds user to set if they have used a command recently
    talkedRecently.add(message.author.id);
    setTimeout(() => {
      // Removes the user from the set after 1 second
      talkedRecently.delete(message.author.id);
    }, 1000);
  }
});

// Bot logs the following events:

client.on("messageDelete", async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  const guild = message.guild;

  const tokenData = await readToken(guild);
  if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id)) return; // prevents double logging of censored messages, probably better way of doing this
  if (!(tokenData.logchannel && tokenData.logmessagedelete)) return;

  const deleteEmbed = new Discord.MessageEmbed()
    .setColor(0xb50300)
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setDescription(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content}`)
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(deleteEmbed).catch(error => console.error(`messageDelete in ${guild} could not be logged because of ${error}!`));
});

client.on("messageDeleteBulk", async messages => {
  const guild = messages.first().guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.logmessagedeletebulk)) return;

  // temporary Dyno-like bulkdelete logging system, will convert into superior system later
  const bulkDeleteEmbed = new Discord.MessageEmbed()
    .setColor(0xb50300)
    .setAuthor(guild.name, guild.iconURL())
    .setDescription(`**${messages.array().length} messages were deleted in ${messages.first().channel}**`)
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(bulkDeleteEmbed).catch(error => console.error(`messageDeleteBulk in ${guild} could not be logged because of ${error}!`));
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (oldMessage.author.bot) return; // Bot ignores itself and other bots
  if (oldMessage.content === newMessage.content) return; // fixes weird link preview glitch

  const guild = oldMessage.guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.logmessageedit)) return;

  const editEmbed = new Discord.MessageEmbed()
    .setColor(0xed7501)
    .setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL())
    .setDescription(`**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`)
    .addFields(
      {name: 'Before:', value: oldMessage.content},
      {name: 'After:', value: newMessage.content}
    )
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(editEmbed).catch(error => console.error(`messageUpdate in ${guild} could not be logged because of ${error}!`));
});

client.on("guildMemberUpdate", async (oldMember, newMember) => { // TODO: finish this by adding role logging
  if (oldMember.user.bot) return;

  const guild = oldMember.guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.lognicknamechange)) return; // will have to update later if I wish to use this for more things than nickname changes

  const updateEmbed = new Discord.MessageEmbed()
    .setColor(0xf6b40c)
    .setAuthor(newMember.user.tag, newMember.user.avatarURL())
    .setFooter(`${new Date()}`);

  if (oldMember.nickname !== newMember.nickname) {
    updateEmbed
      .setDescription(`**${newMember.user} changed their nickname:**`)
      .addFields(
        {name: 'Before:', value: oldMember.nickname || 'None'},
        {name: 'After:', value: newMember.nickname || 'None'}
      );
    client.channels.cache.get(tokenData.logchannel).send(updateEmbed).catch(error => console.error(`guildMemberUpdate in ${guild} could not be logged because of ${error}!`));
  }
});

client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;

  const tokenData = await readToken(guild);

  if (tokenData.autoroles) {
    const autoroles = tokenData.autoroles.trim().split(' ');
    await member.edit({roles: member.roles.cache.array().concat(autoroles)});
  }
  if (!(tokenData.logchannel && tokenData.logmemberjoin)) return;

  // add potential welcome messages later
  const joinEmbed = new Discord.MessageEmbed()
    .setColor(0x79ff3b)
    .setAuthor('Member joined the server', member.user.avatarURL())
    .setDescription(`${member.user} ${member.user.tag}`)
    .setFooter(`${new Date()}`);

  client.channels.cache.get(tokenData.logchannel).send(joinEmbed).catch(error => console.error(`guildMemberAdd in ${guild} could not be logged because of ${error}!`));
});

client.on("guildMemberRemove", async (member) => {
  const guild = member.guild;

  const tokenData = await readToken(guild);
  if (!(guild.systemChannel && tokenData.logmemberleave)) return;

  const leaveEmbed = new Discord.MessageEmbed()
    .setColor(0x333333)
    .setAuthor('Member left the server', member.user.avatarURL())
    .setDescription(`${member.user} ${member.user.tag}`)
    .setFooter(`${new Date()}`);

  guild.systemChannel.send(leaveEmbed).catch(error => console.error(`guildMemberRemove in ${guild} could not be logged because of ${error}!`));
});

client.login(token);
