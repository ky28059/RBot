import {log} from "../utils/logger.js";

export default {
    name: 'kick',
    description: 'Kick a user from this server.',
    usage: 'kick @[user] [reason]',
    examples: 'kick @example Spamming in #general',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client) {
        const guild = message.guild;
        const memberTarget = parsed.memberTarget;

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (memberTarget.user.id === message.author.id) return message.reply("you cannot kick yourself!");
        if (!memberTarget.kickable) return message.reply("I cannot kick this user!");

        // TODO: see todo in ban.js
        let reason = parsed.joined;
        if (!reason) reason = "No reason provided";

        await memberTarget.kick(reason)
            .catch(error => message.reply(`sorry, I couldn't kick because of : ${error}`));

        await log(client, guild, 0x7f0000, memberTarget.user.tag, memberTarget.user.avatarURL(), `**${memberTarget.user} has been kicked by ${message.author} for the reason:**\n${reason}`);
        message.react('👌');
    }
}
