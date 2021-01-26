import {log} from "../utils/logger.js";
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';
import ActionUntakeableError from "../../errors/ActionUntakeableError";


export default {
    name: 'ban',
    description: 'Ban a user from this server.',
    usage: 'ban @[user] [reason]',
    pattern: '@[Target] <Reason>?',
    examples: 'ban @example NSFW imagery',
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client, tag) {
        const guild = message.guild;
        const target = guild.mamber(parsed.target);

        if (target.user.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
        if (!target.bannable)
            throw new ActionUntakeableError(this.name, `${target} too high in hierarchy, unable to ban`);

        let reason = parsed.reason;
        if (!reason) reason = "No reason provided";

        await target.ban(reason);

        await log(client, guild, tag, 0x7f0000, target.user.tag, target.user.avatarURL(), `**${target.user} has been banned by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
