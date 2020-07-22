const Discord = require('discord.js');
const fs = require('fs');
const auth = require('./auth.json');
const fm = require('./fileManager.js');
//import {readFile, writeFile} from './fileManager.js'; // modernity R E J E C T E D
const client = new Discord.Client();

// Initialize Discord Bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('!help'); // sets status
});

client.on("guildCreate", guild => {
  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
    fm.writeFile(path, '{\n "logchannel": "",\n "censoredusers": ""\n}');
  }
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  // maybe move this code elsewhere? idk
  const guild = message.guild;
  const member = guild.member(message.author); // creates a GuildMember of the message's author, needed for the admin only commands
  let tokenData = {}; // probably better way to do this

  // code block reads token and then gets log channel + censored users
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(`./tokens/${guild.id}.json`);
    tokenData = JSON.parse(tokenData);
  }
  const logChannel = tokenData.logchannel || false;
  const censoredUsers = tokenData.censoredusers || false;

  if (message.author.id === censoredUsers) { // TEMP: update later to check if censoredusers is a list
    const censoredEmbed = new Discord.MessageEmbed()
      .setColor(0x333333)
      .setAuthor(`\u200b${message.author.tag}`)
      .setDescription(`Message by ${message.author.tag} censored in ${message.channel.name}: ${message.content}`)
      .setFooter(`${new Date()}`);
    if (logChannel) {
      client.channels.cache.get(logChannel).send(censoredEmbed);
    }
    await message.delete()
      .catch(error => message.reply(`That message could not be censored because of ${error}!`));
  }

  /*
  // Responses that are not commands
  if (message.content.toLowerCase().includes('incorrect')) { // toLowerCase makes this non case sensitive
    message.channel.send('Misleading and Wrong.'); // maybe too spammy?
  }
  */

  // Bot listens to messages with the prefix !
  if (message.content.substring(0, 1) == '!') {
    const args = message.content.slice(1).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
    const command = args.shift().toLowerCase(); // removes the command from the args array

    // Commands
    switch (command) {
      case 'ping':
        let m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        break;

      case 'say':
        if (args.length > 0) {
          let msg = args.join(" ");
          message.channel.send(msg);
        } else {
          message.channel.send('You must specify what to say!');
        }
        break;

      case 'avatar':
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle(user.username)
          .setImage(user.avatarURL())
          .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(avatarEmbed);
        break;

      case 'help': // https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
        const helpEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Dashboard')
          .setDescription('My commands are:')
          .addFields(
            {name: '!ping:', value: 'Gets latency'},
            {name: '!say [message]:', value: 'Makes bot say what you tell it to say'},
            {name: '!avatar @[user]:', value: 'Gets the discord avatar of the mentioned user, defaults to get your avatar when no user is mentioned'},
            {name: '!purge [2-100]:', value: 'Bulk deletes the specified number of messages in the channel the command is called in'},
            {name: '!kick @[user] [reason]:', value: 'Kicks the specified user from the server'},
            {name: '!ban @[user] [reason]:', value: 'Bans the specified user from the server'},
            {name: '!censor @[user]:', value: 'Censors the specified user (autodeletes their messages and logs it in the log channel)'}
          )
          .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(helpEmbed);
        break;

      case 'censor':
        if (!member.hasPermission('MANAGE_MESSAGES')) { // restricts this command to mods only
          return message.reply('You do not have sufficient perms to do that!');
        }

        let censorTarget = message.mentions.members.first();
        if (!censorTarget) {
          return message.reply("Please mention a valid member of this server");
        }
        // TODO: finish censor by making it update the server token
        break;

      case 'purge':
        if (!member.hasPermission('MANAGE_MESSAGES')) { // restricts this command to mods only
          return message.reply('You do not have sufficient perms to do that!');
        }
        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        if(!deleteCount || deleteCount < 2 || deleteCount > 100) {
          return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
        }
        const fetched = await message.channel.messages.fetch({limit: deleteCount});
        message.channel.bulkDelete(fetched)
          .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        break;

      case 'kick':
        if (!member.hasPermission('KICK_MEMBERS')) { // restricts this command to mods only
          return message.reply('You do not have sufficient perms to do that!');
        }

        let kickTarget = message.mentions.members.first();
        if (!kickTarget) {
          return message.reply("Please mention a valid member of this server");
        }
        if (!kickTarget.kickable) {
          return message.reply("I cannot kick this user!");
        }
        // joins remaining args for reason
        let kickReason = args.slice(1).join(' ');
        if (!kickReason) kickReason = "No reason provided";

        await kickTarget.kick(kickReason)
          .catch(error => message.reply(`Sorry ${message.author}, I couldn't kick because of : ${error}`));
        message.channel.send(`${kickTarget.user.tag} has been kicked by ${message.author.tag} for the reason: ${kickReason}`);
        break;

      case 'ban':
        if (!member.hasPermission('BAN_MEMBERS')) { // restricts this command to mods only
          return message.reply('You do not have sufficient perms to do that!');
        }

        let banTarget = message.mentions.members.first();
        if (!banTarget) {
          return message.reply("Please mention a valid member of this server");
        }
        if (!banTarget.bannable) {
          return message.reply("I cannot ban this user!");
        }
        // joins remaining args for reason
        let banReason = args.slice(1).join(' ');
        if (!banReason) banReason = "No reason provided";

        await banTarget.ban(banReason)
          .catch(error => message.reply(`Sorry ${message.author}, I couldn't ban because of : ${error}`));
        message.channel.send(`${banTarget.user.tag} has been banned by ${message.author.tag} for the reason: ${banReason}`);
        break;
    }
  }
});

client.on("messageDelete", async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  // code block reads token and then gets log channel + censored users
  const guild = message.guild;
  let tokenData = {}; // probably better way to do this

  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(`./tokens/${guild.id}.json`);
    tokenData = JSON.parse(tokenData);
  }
  const logChannel = tokenData.logchannel || false;

  if (logChannel) {
    const deleteEmbed = new Discord.MessageEmbed()
      .setColor(0x333333)
      .setAuthor(`Message by ${message.author} in ${message.channel.name} was deleted:`)
      .setDescription(`\u200b${message.content}`) // the \u200b is to not get RangeErrors from empty messages
      .setFooter(`${new Date()}`);
    client.channels.cache.get(logChannel).send(deleteEmbed);
  }
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (oldMessage.author.bot) return; // Bot ignores itself and other bots
  if (oldMessage.content == newMessage.content) return; // fixes weird link preview glitch

  // code block reads token and then gets log channel + censored users
  const guild = oldMessage.guild;
  let tokenData = {}; // probably better way to do this

  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(`./tokens/${guild.id}.json`);
    tokenData = JSON.parse(tokenData);
  }
  const logChannel = tokenData.logchannel || false;

  if (logChannel) {
    const editEmbed = new Discord.MessageEmbed()
      .setColor(0x333333)
      .setAuthor(`Message by ${oldMessage.author} in ${oldMessage.channel.name} was edited:`)
      .addFields(
        {name: 'Before:', value: `\u200b${oldMessage.content}`}, // the \u200b is to not get RangeErrors from empty messages
        {name: 'After:', value: `\u200b${newMessage.content}`}
      )
      .setFooter(`${new Date()}`);
    client.channels.cache.get(logChannel).send(editEmbed);
  }
});

client.login(auth.token);
