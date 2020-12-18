import {MessageEmbed} from 'discord.js';

export default {
    name: 'raw',
    description: 'Displays this server\'s current settings, but in their unparsed form. Useful for testing.',
    usage: 'raw',
    examples: 'raw',
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client, tag) {
        const tokenEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle('Raw Token Data:')
            .setDescription(tag)
            .setFooter(`Requested by ${message.author.tag}`);

        for (let field in tag.dataValues) {
            let data = tag[field];
            tokenEmbed.addField(`${field}:`, `\u200B${data}`);
        }

        message.channel.send(tokenEmbed);
    }
}
