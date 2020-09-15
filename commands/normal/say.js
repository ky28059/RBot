const {Command} = require('discord.js-commando');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'normal',
      description: 'Makes the bot say what you tell it to say.',
      args: [
        {
          key: 'content',
          prompt: 'What text would you like the bot to say?',
          type: 'string',
        },
      ],
    });
  }

  run(message, { content }) {
    return message.say(content);
  }
}