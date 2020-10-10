import {log} from "../utils/logger.js";

export default {
    name: 'ban',
    description: 'Ban a user from this server.',
    usage: 'ban @[user] [reason]',
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client) { // target = GuildMember
        const guild = message.guild;
        const membertarget = parsed.memberTarget;

        if (!memberTarget) return message.reply("please mention a valid member of this server");
        if (memberTarget.user.id === message.author.id) return message.reply("you cannot ban yourself!");
        if (!memberTarget.bannable) return message.reply("I cannot ban this user!");

        // TODO: not sure why I didn't catch this before but reason includes memberTarget
        let reason = parsed.joined;
        if (!reason) reason = "No reason provided";

        await memberTarget.ban(reason)
            .catch(error => message.reply(`sorry, I couldn't ban because of : ${error}`));

        await log(client, guild, 0x7f0000, memberTarget.user.tag, memberTarget.user.avatarURL(), `**${memberTarget.user} has been banned by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
