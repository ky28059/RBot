import { canModifyQueue } from "../utils/canModifyQueue.js";


export default {
    name: "die",
    description: 'Kills the music.',
    usage: 'die',
    examples: 'die',
    guildOnly: true,
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);

        if (!queue) return message.reply("There is nothing playing.");
        if (!canModifyQueue(message.member)) return;

        queue.songs = [];
        queue.connection.dispatcher.end();
        queue.textChannel.send(`${message.author} ⏹ stopped the music!`);
    }
};