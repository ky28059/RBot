import {log} from "../utils/logger.js";

export default {
    name: 'disable',
    description: 'Disables a command.',
    usage: 'disable [command name]',
    examples: 'disable censor',
    guildOnly: true,
    permReqs: 'ADMINISTRATOR',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const commands = parsed.raw;
        if (!commands) return message.reply("please mention commands to disable!");

        const tag = await client.Tags.findOne({ where: { guildID: guild.id } });

        for (let command of commands) {
            if (command === 'disable' || command === 'enable') return message.reply(`you cannot disable ${command}!`);
            if (!client.commands.has(command)) return message.reply(`the command ${command} does not exist!`);
            if (tag.disabled_commands.includes(command)) return message.reply(`the command ${command} is already disabled!`);

            tag.disabled_commands += `${command} `;
        }

        await tag.save();
        await log(client, guild, 0xf6b40c, message.author.tag, message.author.avatarURL(), `**Commands [${commands.join(', ')}] were disabled by ${message.author} in ${message.channel}**\n[Jump to message](${message.url})`);
        message.channel.send(`Disabling \`[${commands.join(', ')}]\`!`);
    }
}
