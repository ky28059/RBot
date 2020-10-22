import {log} from "../utils/logger.js";

export default {
    name: 'enable',
    description: 'Enables a disabled command.',
    usage: 'enable [command name]',
    examples: 'enable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to reenable!");

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });

        for (let command of commands) {
            if (!client.commands.has(command)) return message.reply(`the command ${command} does not exist!`);
            if (!tag.disabled_commands.includes(command)) return message.reply(`the command ${command} was not disabled!`);

            tag.disabled_commands = tag.disabled_commands.replace(`${command} `, '');
        }

        await tag.save();
        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Commands [${commands.join(', ')}] were reenabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Reenabling \`[${commands.join(', ')}]\`!`);
    }
}
