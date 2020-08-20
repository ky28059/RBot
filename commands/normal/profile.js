import Discord from 'discord.js';

export function profile(message, guild, target) {
  // TODO: make prettier, add functionality
  const profileTarget = target || message.author;
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
}

//export {profile};
