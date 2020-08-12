// TODO: add in .catch()s so that the bot wont break as much
// TODO: add in catchs on commands that require token information to check for if a token is lacking the field that command requires (currently only have checks for if a server is missing a token)
const Discord = require('discord.js');
const fs = require('fs');
const auth = require('./auth.json');
const fm = require('./fileManager.js');
//const parser = require('./toolkit/parser.js');
const client = new Discord.Client();

const talkedRecently = new Set();

// Initialize Discord Bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('!help', { type: "LISTENING" });
});

client.on("guildCreate", guild => { // writes token upon joining new server
  const path = `./tokens/${guild.id}.json`;
  if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
    fm.readFile('./tokens/example.json').then(cache =>
      fm.writeFile(path, cache)
    );
  }
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on('message', async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots
  if (talkedRecently.has(message.author.id)) return; // Spam prevention

  talkedRecently.add(message.author.id);
  setTimeout(() => {
    // Removes the user from the set after 1 second
    talkedRecently.delete(message.author.id);
  }, 1000);

  // maybe move this code elsewhere? idk
  const guild = message.guild;
  const member = guild.member(message.author);

  // code block reads token and then gets log channel + censored users
  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

    const userTarget = message.mentions.users.first() || client.users.cache.get(args[0]);
    const memberTarget = message.mentions.members.first() || guild.members.cache.get(args[0]);
    const channelTarget = message.mentions.channels.first();

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
        const avatarTarget = userTarget || message.author;
        const avatarEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle(avatarTarget.username)
          .setImage(avatarTarget.avatarURL({ size: 4096 }))
          .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(avatarEmbed);
        break;

      case 'profile':
        const profileTarget = userTarget || message.author;
        const guildProfileTarget = guild.member(profileTarget);

        const profileEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setAuthor(`\u200b${profileTarget.tag}`, profileTarget.avatarURL())
          .addFields(
            {name: 'Account created on', value: `\u200b${profileTarget.createdAt}`},
            {name: 'Server joined on', value: `\u200b${guildProfileTarget.joinedAt}`},
          )
          .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(profileEmbed);
        break;

      case 'gild':
        message.channel.messages.fetch({limit: 2}).then(messages => {
          let gildTarget = messages.last();
          gildTarget.react('727100873016344687');
          gildTarget.react('726691291970404353');
          gildTarget.react('726691292020736110');
          messages.first().delete();
        });
        break;

      case 'help': // https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
        const helpEmbed1 = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Non-Admin Commands:')
          .addFields(
            {name: '!ping:', value: 'Gets latency'},
            {name: '!say [message]:', value: 'Makes bot say what you tell it to say'},
            {name: '!avatar @[user]:', value: 'Gets the discord avatar of the mentioned user, defaults to get your avatar when no user is mentioned'},
            {name: '!profile @[user]:', value: 'Gets some information about the mentioned user'},
            {name: '!gild:', value: 'Gives some Reddit gold to the last message sent'}
          )
          .setFooter(`Requested by ${message.author.tag}`);
        const helpEmbed2 = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Admin Commands:')
          .addFields(
            {name: '!purge [2-100]:', value: 'Bulk deletes the specified number of messages in the channel the command is called in'},
            {name: '!expunge [2-100]:', value: 'Removes all reactions from the specifed number of messages in the channel the command is called in'},
            {name: '!kick @[user] [reason]:', value: 'Kicks the specified user from the server'},
            {name: '!ban @[user] [reason]:', value: 'Bans the specified user from the server'},
            {name: '!censor @[user]:', value: 'Censors the specified user (autodeletes their messages and logs it in the log channel)'},
            {name: '!uncensor @[user]:', value: 'Uncensors the specified user'},
            {name: '!censored:', value: 'Shows which users are currently censored'},
            {name: '!addemote [image link] [name]:', value: 'Creates an emoji with the given image and name'} // this feels awkward here
          )
          .setFooter(`Requested by ${message.author.tag}`);
        const helpEmbed3 = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Token Commands:')
          .addFields(
            {name: '!update:', value: 'Updates the server\'s token'},
            {name: '!set [token field] [value]:', value: 'Sets token data'},
            {name: '!presets:', value: 'Gets the values of the server\'s current presets'}
          )
          .setFooter(`Requested by ${message.author.tag}`);

        // high level reaction listening
        const helpMessage = await message.channel.send(helpEmbed1);

        const filter = (reaction, user) => {
          return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        //for (let i = 0; i < 5; i++) { // this doesn't work, thanks james!!
          await helpMessage.react('1️⃣');
          await helpMessage.react('2️⃣');
          await helpMessage.react('3️⃣');

          // https://discordjs.guide/popular-topics/reactions.html#awaiting-reactions
          helpMessage.awaitReactions(filter, { max: 1, time: 30000 })
            .then(collected => {
              switch (collected.first().emoji.name) {
                case '1️⃣':
                  helpMessage.edit(helpEmbed1);
                  break;
                case '2️⃣':
                  helpMessage.edit(helpEmbed2);
                  break;
                case '3️⃣':
                  helpMessage.edit(helpEmbed3);
                  break;
              }
              //helpMessage.reactions.removeAll();
            });
        //}
        break;

      case 'update':
        const exTokenContents = await fm.readFile('./tokens/example.json');
        const exTokenData = JSON.parse(exTokenContents); // my variable names are so horrible

        const tokenDataKeys = Object.keys(tokenData);
        const exTokenDataKeys = Object.keys(exTokenData);

        if (!fs.existsSync(path)) { // checks if there's an already existing token for that server
          fm.writeFile(path, exTokenContents)
          message.channel.send('Token generated!');

        } else if (JSON.stringify(tokenDataKeys) != JSON.stringify(exTokenDataKeys)) {
          tokenData = { ...exTokenData, ...tokenData}; // credit to Sean for this fantastically simple but amazing code
          fm.writeFile(path, JSON.stringify(tokenData));
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
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! Log channel has been updated to ${channelTarget}!`);
            break;

          case 'prefix':
            const newPrefix = args.join(" ");
            if (!newPrefix) return message.reply('you must specify a prefix to set!')

            tokenData.prefix = newPrefix;
            await fm.writeFile(path, JSON.stringify(tokenData));
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
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Message Deletes\` have been set to ${tokenData.logmessagedelete}!`);
            break;

          case 'messagedeletebulk':
            tokenData.logmessagedeletebulk = !tokenData.logmessagedeletebulk;
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Bulk Message Deletes\` have been set to ${tokenData.logmessagedeletebulk}!`);
            break;

          case 'messageedit':
            tokenData.logmessageedit = !tokenData.logmessageedit;
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Message Updates\` have been set to ${tokenData.logmessageedit}!`);
            break;

          case 'nicknamechange':
            tokenData.lognicknamechange = !tokenData.lognicknamechange;
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Nickname Changes\` have been set to ${tokenData.lognicknamechange}!`);
            break;

          case 'memberjoin':
            tokenData.logmemberjoin = !tokenData.logmemberjoin;
            await fm.writeFile(path, JSON.stringify(tokenData));
            message.channel.send(`Success! \`Member Joins\` have been set to ${tokenData.logmemberjoin}!`);
            break;

          case 'memberleave':
            tokenData.logmemberleave = !tokenData.logmemberleave;
            await fm.writeFile(path, JSON.stringify(tokenData));
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
        await fm.writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Now censoring ${userTarget.tag}!`);
        break;

      case 'uncensor':
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe add extra required perms?
        if (!fs.existsSync(path)) return message.reply('this server does not have a valid token yet! Try doing !update!');

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (!tokenData.censoredusers.includes(memberTarget.id)) return message.reply("that user was not censored!");

        tokenData.censoredusers = tokenData.censoredusers.replace(memberTarget.id + ' ', '');
        await fm.writeFile(path, JSON.stringify(tokenData));
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
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);
        if (!deleteCount || deleteCount < 2 || deleteCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to delete");

        const fetchedDeletes = await message.channel.messages.fetch({limit: deleteCount});
        message.channel.bulkDelete(fetchedDeletes)
          .catch(error => message.reply(`couldn't delete messages because of: ${error}`));
        break;

      case 'expunge': // TODO: make this not super slow
        if (!member.hasPermission('MANAGE_MESSAGES')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only, maybe require different perms?

        // get the delete count, as an actual number.
        const expungeCount = parseInt(args[0], 10);
        if (!expungeCount || expungeCount < 2 || expungeCount > 100) return message.reply("please provide a number between 2 and 100 for the number of messages to expunge reactions from");

        const fetchedExpunged = await message.channel.messages.fetch({limit: expungeCount});
        fetchedExpunged.array().forEach(message => message.reactions.removeAll());
        message.react('👌');
        break;

      case 'kick':
        if (!member.hasPermission('KICK_MEMBERS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (memberTarget.user.id === message.author.id) return message.reply("you cannot kick yourself!");
        if (!memberTarget.kickable) return message.reply("I cannot kick this user!");

        // joins remaining args for reason
        let kickReason = args.slice(1).join(' ');
        if (!kickReason) kickReason = "No reason provided";

        await memberTarget.kick(kickReason)
          .catch(error => message.reply(`sorry, I couldn't kick because of : ${error}`));

        if (tokenData.logchannel) {
          const kickEmbed = new Discord.MessageEmbed()
            .setColor(0x7f0000)
            .setAuthor(`\u200b${userTarget.tag}`, userTarget.avatarURL())
            .setDescription(`**${userTarget} has been kicked by ${message.author} for the reason:**\n${kickReason}`)
          client.channels.cache.get(tokenData.logchannel).send(kickEmbed);
        }
        message.react('👌');
        break;

      case 'ban':
        if (!member.hasPermission('BAN_MEMBERS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (memberTarget.user.id === message.author.id) return message.reply("you cannot ban yourself!");
        if (!memberTarget.bannable) return message.reply("I cannot ban this user!");

        // joins remaining args for reason
        let banReason = args.slice(1).join(' ');
        if (!banReason) banReason = "No reason provided";

        await memberTarget.ban(banReason)
          .catch(error => message.reply(`sorry, I couldn't ban because of : ${error}`));

        if (tokenData.logchannel) {
          const banEmbed = new Discord.MessageEmbed()
            .setColor(0x7f0000)
            .setAuthor(`\u200b${userTarget.tag}`, userTarget.avatarURL())
            .setDescription(`**${userTarget} has been banned by ${message.author} for the reason:**\n${banReason}`)
          client.channels.cache.get(tokenData.logchannel).send(banEmbed);
        }
        message.react('👌');
        break;

      case 'addemote':
        if (!member.hasPermission('MANAGE_EMOJIS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

        let name = args.slice(1).join('_'); // discord does not allow spaces or dashes in emoji names :(
        guild.emojis.create(args[0], name)
          .then(emoji => message.channel.send(`Created new emoji with name ${emoji.name}!`))
          .catch(error => message.channel.send(`Sorry ${message.author}, I couldn't create emoji because of : ${error}`));
        break;
    }
  }
});

// Bot logs the following events:

client.on("messageDelete", async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  // code block reads token and then gets log channel + censored users
  const guild = message.guild;

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
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

  let tokenData = {}; // probably better way to do this
  const path = `./tokens/${guild.id}.json`;
  if (fs.existsSync(path)) { // checks if the token exists
    tokenData = await fm.readFile(path);
    tokenData = JSON.parse(tokenData);
  }
  if (!(guild.systemChannel && tokenData.logmemberleave)) return;

  const leaveEmbed = new Discord.MessageEmbed()
    .setColor(0x333333)
    .setAuthor('Member left the server', member.user.avatarURL())
    .setDescription(`${member.user} ${member.user.tag}`)
    .setFooter(`${new Date()}`);

  guild.systemChannel.send(leaveEmbed);
});

client.login(auth.token);
