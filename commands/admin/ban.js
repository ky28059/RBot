const {log} = require("../utils/logger.js");
const {Command} = require('discord.js-commando');

async function ban(message, target, reason, logChannel, client) { // target = GuildMember
  const guild = message.guild;

  await target.ban(reason)
    .catch(error => message.reply(`sorry, I couldn't ban because of : ${error}`));

  if (logChannel) {
    await log(client, guild, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been banned by ${message.author} for the reason:**\n${reason}`);
  }

}

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      memberName: 'ban',
      group: 'admin',
      description: 'Replies with the text you provide.',
      args: [
        {
          key: 'reason',
          prompt: 'What text would you like the bot to say?',
          type: 'string',
          default: 'No reason provided'
        },
      ],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      guildOnly: true,
    });
  }

  async run(message, { reason }) {
    const target = message.mentions.members.first() || guild.members.cache.get(snowflakes[0]) || guild.members.cache.find(member => member.user.username === args[0]);
    if (!target) return message.reply("please mention a valid member of this server");
    if (target.user.id === message.author.id) return message.reply("you cannot ban yourself!");
    if (!target.bannable) return message.reply("I cannot ban this user!");


    message.say(reason);
    await message.react('👌');
  }
}
