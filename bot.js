// TODO: add in .catch()s so that the bot wont break as much
// TODO: add in catchs on commands that require token information to check for if a token is lacking the field that command requires (currently only have checks for if a server is missing a token)
import Discord from 'discord.js';
import fs from 'fs';
import {token} from './auth.js';
import {writeFile, readFile} from './fileManager.js';

import addemote from './commands/addemote.js'; // https://javascript.info/import-export
import avatar from './commands/avatar.js';
import ban from './commands/ban.js';
import expunge from './commands/expunge.js';
import gild from './commands/gild.js';
import help from './commands/help.js';
import kick from './commands/kick.js';
import ping from './commands/ping.js';
import profile from './commands/profile.js';
import purge from './commands/purge.js';
import say from './commands/say.js';

const client = new Discord.Client();
const talkedRecently = new Set();

// code block reads server token and gets info
async function readToken(guild) {
  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await readFile(path);
    tokenData = JSON.parse(tokenData);
  }
  return tokenData;
}

// Initialize Discord Bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('!help', { type: "LISTENING" });
});

client.on("guildCreate", guild => { // writes token upon joining new server
  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
    readFile('./tokens/example.json').then(cache =>
      writeFile(path, cache)
    );
  }
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots
  if (talkedRecently.has(message.author.id)) return; // Spam prevention

  // maybe move this code elsewhere? idk
  const guild = message.guild;
  const member = guild.member(message.author);

  const tokenData = await readToken(guild);
  const prefix = tokenData.prefix || '!'; // maybe move somewhere else?

  if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id)) {
    const censoredEmbed = new Discord.MessageEmbed()
      .setColor(0x7f0000)
      .setAuthor(`\u200b${message.author.tag}`, message.author.avatarURL())
      .setDescription(`**Message by ${message.author} censored in ${message.channel}:**\n${message.content}`)
      .setFooter(`${new Date()}`);
    if (tokenData.logchannel) {
      client.channels.cache.get(tokenData.logchannel).send(censoredEmbed);
    }
    await message.delete() // TODO: fix this hilariousness of pinging the censored person and apologizing for not being able to delete their message
      .catch(error => message.reply(`that message could not be censored because of ${error}!`));
    return;
  }

  if (message.content.substring(0, prefix.length) == prefix) {
    const args = message.content.slice(prefix.length).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
    const command = args.shift().toLowerCase(); // removes the command from the args array

    const userTarget = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(user => user.username === args[0]);
    const memberTarget = message.mentions.members.first() || guild.members.cache.get(args[0]) || guild.members.cache.find(member => member.user.username === args[0]);
    const channelTarget = message.mentions.channels.first() || client.channels.cache.get(args[0]);

    const path = `./tokens/${guild.id}.json`; // needed for existssync

    // Commands
    switch (command) {
      case 'ping':
        ping(message);
        break;

      case 'say':
        say(message, args.join(' '));
        break;

      case 'avatar':
        avatar(message, userTarget);
        break;

      case 'profile':
        profile(message, guild, userTarget);
        break;

      case 'gild':
        gild(message);
        break;

      case 'help':
        help(message);
        break;

      case 'update':
        const exTokenContents = await readFile('./tokens/example.json');
        const exTokenData = JSON.parse(exTokenContents); // my variable names are so horrible

        const tokenDataKeys = Object.keys(tokenData);
        const exTokenDataKeys = Object.keys(exTokenData);

        if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
          writeFile(path, exTokenContents)
          message.channel.send('Token generated!');

        } else if (JSON.stringify(tokenDataKeys) != JSON.stringify(exTokenDataKeys)) {
          tokenData = { ...exTokenData, ...tokenData}; // credit to Sean for this fantastically simple but amazing code
          writeFile(path, JSON.stringify(tokenData));
          message.channel.send('Token updated!'); // maybe add in fields so that people know exactly which fields were updated? seems super complicated tho

        } else {
          message.channel.send('Your token is up to date!');
        }
        break;

      case 'set':
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // TODO: require a different perm for this command
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');
        if (!args[0]) return message.reply('you must specify the token field to modify!');

        const field = args.shift().toLowerCase();

        switch (field) {
          case 'logchannel':
            if (!channelTarget) return message.reply("please mention a valid channel in this server");

            tokenData.logchannel = channelTarget.id;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! Log channel has been updated to ${channelTarget}!`);
            break;

          case 'prefix':
            const newPrefix = args.join(" ");
            if (!newPrefix) return message.reply('you must specify a prefix to set!')

            tokenData.prefix = newPrefix;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! Prefix has been updated to \`${newPrefix}\`!`);
            break;

          default:
            return message.reply('you must specify a valid token field to modify! Valid token fields: `logchannel, prefix`');
        }
        break;

      case 'toggle':
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // TODO: require a different perm for this command
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');
        if (!args[0]) return message.reply('you must specify the logged action to toggle!');

        const preset = args.shift().toLowerCase();

        switch (preset) { // definitely more efficient way of doing this
          case 'messagedelete':
            tokenData.logmessagedelete = !tokenData.logmessagedelete;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Message Deletes\` have been set to ${tokenData.logmessagedelete}!`);
            break;

          case 'messagedeletebulk':
            tokenData.logmessagedeletebulk = !tokenData.logmessagedeletebulk;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Bulk Message Deletes\` have been set to ${tokenData.logmessagedeletebulk}!`);
            break;

          case 'messageedit':
            tokenData.logmessageedit = !tokenData.logmessageedit;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Message Updates\` have been set to ${tokenData.logmessageedit}!`);
            break;

          case 'nicknamechange':
            tokenData.lognicknamechange = !tokenData.lognicknamechange;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Nickname Changes\` have been set to ${tokenData.lognicknamechange}!`);
            break;

          case 'memberjoin':
            tokenData.logmemberjoin = !tokenData.logmemberjoin;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Member Joins\` have been set to ${tokenData.logmemberjoin}!`);
            break;

          case 'memberleave':
            tokenData.logmemberleave = !tokenData.logmemberleave;
            await writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Member Leaves\` have been set to ${tokenData.logmemberleave}!`);
            break;

          default:
            return message.reply('you must specify a valid logged action to toggle! Logged actions: `messagedelete`, `messagedeletebulk`, `messageedit`, `nicknamechange`, `memberjoin`, `memberleave`');
        }
        break;

      case 'presets':
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        // TODO: make this embed look better
        const tokenEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Presets:')
          .addFields( // TODO: make a for each loop that adds available fields automatically so this command won't need to be manually updated
            {name: 'Prefix:', value: tokenData.prefix || '!'},
            {name: 'Log Channel:', value: tokenData.logchannel || 'None'},
            {name: 'Message Deletes', value: tokenData.logmessagedelete, inline: true}, // I have no idea how to catch when tokenData is missing these fields without using ??
            {name: 'Bulk Message Deletes', value: tokenData.logmessagedeletebulk, inline: true},
            {name: 'Message Edits', value: tokenData.logmessageedit, inline: true},
            {name: 'Nickname Changes', value: tokenData.lognicknamechange, inline: true},
            {name: 'Member Joins', value: tokenData.logmemberjoin, inline: true},
            {name: 'Member Leaves', value: tokenData.logmemberleave, inline: true}
          )
          .setFooter(`Requested by ${message.author.tag}`);

        message.channel.send(tokenEmbed);
        break;

      case 'censor':
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (memberTarget.id === message.author.id) return message.reply("you cannot censor yourself!");
        if (userTarget.bot) return message.reply("bots cannot be censored!"); // should bots be allowed to be censored?
        if (tokenData.censoredusers.includes(memberTarget.id)) return message.reply("that user is already censored!");

        tokenData.censoredusers += memberTarget.id + ' ';
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Now censoring ${userTarget.tag}!`);
        break;

      case 'uncensor':
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (!tokenData.censoredusers.includes(memberTarget.id)) return message.reply("that user was not censored!");

        tokenData.censoredusers = tokenData.censoredusers.replace(memberTarget.id + ' ', '');
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Now uncensoring ${userTarget.tag}!`);
        break;

      case 'censored':
        const censoredListEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Censored Users:')
          .setFooter(`Requested by ${message.author.tag}`);

        if (!tokenData.censoredusers) {
          censoredListEmbed.setDescription('No one is censored!')
        } else {
          let censoredList = tokenData.censoredusers.trim().split(' ');
          censoredList.forEach(user =>
            censoredListEmbed.addField(`\u200b${client.users.cache.get(user).tag}`, `\u200b${client.users.cache.get(user).id}`)
          )
        }
        message.channel.send(censoredListEmbed);
        break;

      case 'purge':
        purge(message, guild, args[0]);
        break;

      case 'expunge':
        expunge(message, guild, args[0]);
        break;

      case 'kick':
        kick(message, guild, memberTarget, args.join(' '), tokenData.logchannel);
        break;

      case 'ban':
        ban(message, guild, memberTarget, args.join(' '), tokenData.logchannel);
        break;

      case 'addemote':
        let name = args.slice(1).join('_'); // discord does not allow spaces or dashes in emoji names :(
        addemote(message, guild, args[0], name);
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

  // code block reads token and then gets log channel + censored users
  const guild = message.guild;

  const tokenData = await readToken(guild);
  if (tokenData.censoredusers && tokenData.censoredusers.includes(message.author.id)) return; // prevents double logging of censored messages, probably better way of doing this
  if (!(tokenData.logchannel && tokenData.logmessagedelete)) return;

  const deleteEmbed = new Discord.MessageEmbed()
    .setColor(0xb50300)
    .setAuthor(`\u200b${message.author.tag}`, message.author.avatarURL())
    .setDescription(`**Message by ${message.author} in ${message.channel} was deleted:**\n${message.content}`)
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(deleteEmbed);
});

client.on("messageDeleteBulk", async messages => {
  // code block reads token and then gets log channel + censored users
  const guild = messages.first().guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.logmessagedeletebulk)) return;

  // temporary Dyno-like bulkdelete logging system, will convert into superior system later
  const bulkDeleteEmbed = new Discord.MessageEmbed()
    .setColor(0xb50300)
    .setAuthor(`\u200b${guild.name}`, guild.iconURL())
    .setDescription(`**${messages.array().length} messages were deleted in ${messages.first().channel}**`)
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(bulkDeleteEmbed);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (oldMessage.author.bot) return; // Bot ignores itself and other bots
  if (oldMessage.content == newMessage.content) return; // fixes weird link preview glitch

  // code block reads token and then gets log channel + censored users
  const guild = oldMessage.guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.logmessageedit)) return;

  const editEmbed = new Discord.MessageEmbed()
    .setColor(0xed7501)
    .setAuthor(`\u200b${oldMessage.author.tag}`, oldMessage.author.avatarURL())
    .setDescription(`**Message by ${oldMessage.author} in ${oldMessage.channel} was edited:**`)
    .addFields(
      {name: 'Before:', value: `\u200b${oldMessage.content}`}, // the \u200b is to not get RangeErrors from empty messages
      {name: 'After:', value: `\u200b${newMessage.content}`}
    )
    .setFooter(`${new Date()}`);
  client.channels.cache.get(tokenData.logchannel).send(editEmbed);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => { // TODO: finish this by adding role logging
  if (oldMember.user.bot) return;

  // code block reads token and then gets log channel + censored users
  const guild = oldMember.guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.lognicknamechange)) return; // will have to update later if I wish to use this for more things than nickname changes

  const updateEmbed = new Discord.MessageEmbed()
    .setColor(0xf6b40c)
    .setAuthor(`\u200b${newMember.user.tag}`, newMember.user.avatarURL())
    .setFooter(`${new Date()}`);

  if (oldMember.nickname != newMember.nickname) {
    updateEmbed
      .setDescription(`**${newMember.user} changed their nickname:**`)
      .addFields(
        {name: 'Before:', value: oldMember.nickname || 'None'},
        {name: 'After:', value: newMember.nickname || 'None'}
      );
    client.channels.cache.get(tokenData.logchannel).send(updateEmbed);
  }
});

client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;

  const tokenData = await readToken(guild);
  if (!(tokenData.logchannel && tokenData.logmemberjoin)) return;

  // add potential welcome messages later
  const joinEmbed = new Discord.MessageEmbed()
    .setColor(0x79ff3b)
    .setAuthor('Member joined the server', member.user.avatarURL())
    .setDescription(`${member.user} ${member.user.tag}`)
    .setFooter(`${new Date()}`);

  client.channels.cache.get(tokenData.logchannel).send(joinEmbed);
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

  guild.systemChannel.send(leaveEmbed);
});

client.login(token);
