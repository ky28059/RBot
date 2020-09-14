import {log} from "../utils/logger.js";

export async function kick(message, target, reason, logChannel, client) { // target = GuildMember
  const guild = message.guild;
  if (!guild.member(message.author).hasPermission('KICK_MEMBERS')) return message.reply('you do not have sufficient perms to do that!'); // restricts this command to mods only

  if (!target) return message.reply("please mention a valid member of this server");
  if (target.user.id === message.author.id) return message.reply("you cannot kick yourself!");
  if (!target.kickable) return message.reply("I cannot kick this user!");

  if (!reason) reason = "No reason provided";

  await target.kick(reason)
    .catch(error => message.reply(`sorry, I couldn't kick because of : ${error}`));

  if (logChannel) {
    await log(client, guild, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been kicked by ${message.author} for the reason:**\n${reason}`);
  }
  message.react('👌');
}

//export {kick};
