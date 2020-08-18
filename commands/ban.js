async function ban(message, guild, target, reason, logChannel) { // target = GuildMember
  if (!guild.member(message.author).hasPermission('BAN_MEMBERS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

  if (!target) return message.reply("please mention a valid member of this server");
  if (target.user.id === message.author.id) return message.reply("you cannot ban yourself!");
  if (!target.bannable) return message.reply("I cannot ban this user!");

  if (!reason) reason = "No reason provided";

  await target.ban(reason)
    .catch(error => message.reply(`sorry, I couldn't ban because of : ${error}`));

  if (logChannel) {
    const banEmbed = new Discord.MessageEmbed()
      .setColor(0x7f0000)
      .setAuthor(`\u200b${target.user.tag}`, target.user.avatarURL())
      .setDescription(`**${target.user} has been banned by ${message.author} for the reason:**\n${reason}`)
    client.channels.cache.get(logChannel).send(banEmbed);
  }
  message.react('👌');
}

export default ban;
