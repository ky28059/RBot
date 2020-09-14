import Command from 'discord.js-commando';

export class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'normal',
      description: 'Replies with the text you provide.',
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