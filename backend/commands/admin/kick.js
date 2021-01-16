import {log} from "../utils/logger.js";
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'kick',
    description: 'Kick a user from this server.',
    usage: 'kick @[user] [reason]',
    pattern: '@[Target] <Reason>?',
    examples: 'kick @example Spamming in #general',
    guildOnly: true,
    permReqs: 'KICK_MEMBERS',
    clientPermReqs: 'KICK_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const target = guild.member(parsed.target);

        if (target.user.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
        if (!target.kickable)
            return message.reply("I cannot kick this user!");

        let reason = parsed.reason;
        if (!reason) reason = "No reason provided";

        await target.kick(reason);

        await log(client, guild, tag, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been kicked by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
