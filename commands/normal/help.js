import Discord from 'discord.js';

export async function help(message) {
  // https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
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
      {name: '!purge [2-100]:', value: 'Bulk deletes the specified number of messages in the channel the command is called in\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!expunge [2-100]:', value: 'Removes all reactions from the specifed number of messages in the channel the command is called in\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!kick @[user] [reason]:', value: 'Kicks the specified user from the server\n[PERMS REQUIRED: KICK_MEMBERS]'},
      {name: '!ban @[user] [reason]:', value: 'Bans the specified user from the server\n[PERMS REQUIRED: BAN_MEMBERS]'},
      {name: '!censor @[user]:', value: 'Censors the specified user (autodeletes their messages and logs it in the log channel)\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!uncensor @[user]:', value: 'Uncensors the specified user\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!censored:', value: 'Shows which users are currently censored'},
      {name: '!addemote [image link] [name]:', value: 'Creates an emoji with the given image and name\n[PERMS REQUIRED: MANAGE_EMOJIS]'} // this feels awkward here
    )
    .setFooter(`Requested by ${message.author.tag}`);
  const helpEmbed3 = new Discord.MessageEmbed()
    .setColor(0x333333)
    .setTitle('Token Commands:')
    .addFields(
      {name: '!update:', value: 'Updates the server\'s token'},
      {name: '!set [token field] [value]:', value: 'Sets token data\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!toggle [logged action]:', value: 'Toggles whether RBot will log that action\n[PERMS REQUIRED: MANAGE_MESSAGES]'},
      {name: '!disable [command name]:', value: 'Disables the use of the given command for this server\n[PERMS REQUIRED: ADMINISTRATOR]'},
      {name: '!enable [command name]:', value: 'Enables the use of the given command for this server\n[PERMS REQUIRED: ADMINISTRATOR]'},
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
}

//export {help};
