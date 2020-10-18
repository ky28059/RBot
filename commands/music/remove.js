import { canModifyQueue } from "../utils/canModifyQueue.js";

export default {
    name: "remove",
    description: 'Removes a song from the queue.',
    usage: 'remove [song number]',
    examples: 'remove 5',
    execute(message, parsed) {
        const args = parsed.raw;
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.channel.send("There is no queue.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        if (!args.length) return message.reply(`Usage: ${message.client.prefix}remove <Queue Number>`);
        if (isNaN(args[0])) return message.reply(`Usage: ${message.client.prefix}remove <Queue Number>`);

        const song = queue.songs.splice(args[0] - 1, 1);
        queue.textChannel.send(`${message.author} ❌ removed **${song[0].title}** from the queue.`);
    }
};