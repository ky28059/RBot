import Discord from 'discord.js';

export async function kick(message, guild, target, reason, logChannel) { // target = GuildMember
  if (!guild.member(message.author).hasPermission('KICK_MEMBERS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

  if (!target) return message.reply("please mention a valid member of this server");
  if (target.user.id === message.author.id) return message.reply("you cannot kick yourself!");
  if (!target.kickable) return message.reply("I cannot kick this user!");

  if (!reason) reason = "No reason provided";

  await target.kick(reason)
    .catch(error => message.reply(`sorry, I couldn't kick because of : ${error}`));

  if (logChannel) {
    const kickEmbed = new Discord.MessageEmbed()
      .setColor(0x7f0000)
      .setAuthor(`\u200b${target.user.tag}`, target.user.avatarURL())
      .setDescription(`**${target.user} has been kicked by ${message.author} for the reason:**\n${reason}`)
    client.channels.cache.get(logChannel).send(kickEmbed).catch(error => console.error(`Kick in ${guild} could not be logged because of ${error}!`));
  }
  message.react('👌');
}

//export {kick};
