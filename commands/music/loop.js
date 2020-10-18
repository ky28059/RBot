import { canModifyQueue } from "../utils/canModifyQueue.js";

export default {
    name: "loop",
    aliases: ['l'],
    description: 'Toggles whether the bot will loop the queue.',
    usage: 'loop',
    examples: 'loop',
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.reply("There is nothing playing.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        // toggle from false to true and reverse
        queue.loop = !queue.loop;
        return queue.textChannel
            .send(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
            .catch(console.error);
    }
};