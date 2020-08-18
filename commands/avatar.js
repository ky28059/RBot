function avatar(message, target) {
  const avatarTarget = target || message.author;
  const avatarEmbed = new Discord.MessageEmbed()
    .setColor(0x333333)
    .setTitle(avatarTarget.username)
    .setImage(avatarTarget.avatarURL({ size: 4096, dynamic: true, format: 'png' }))
    .setFooter(`Requested by ${message.author.tag}`);
  message.channel.send(avatarEmbed);
}

export default avatar;
