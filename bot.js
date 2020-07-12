const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
//let isStreaming = false;

// Initialize Discord Bot
client.on('ready', () => {
  console.log('Logged in as ${client.user.tag}!');
  client.user.setActivity('!help'); // sets status
});
client.on('message', async message => {
  if (message.author.bot) return; // Bot ignores itself and other bots

  // Responses that are not commands
  if (message.content.toLowerCase().includes('incorrect')) { // toLowerCase makes this non case sensitive
    message.channel.send('Misleading and Wrong.'); // maybe too spammy?
  }

  // Bot listens to messages with the prefix !
  if (message.content.substring(0, 1) == '!') {
    const args = message.content.slice(1).trim().split(/ +/g); // removes the prefix, then the spaces, then splits into array
    const command = args.shift().toLowerCase(); // removes the command from the args array

    // Commands
    switch (command) {
      case 'ping':
        let m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        break;

      case 'say':
        if (args.length > 0) {
          let msg = args.join(" ");
          message.channel.send(msg);
        } else {
          message.channel.send('You must specify what to say!');
        }
        break;

      case 'avatar':
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setAuthor(user.username)
          .setImage(user.avatarURL());
        message.channel.send(avatarEmbed);
        break;

      /*
      case 'stream': // streaming lol
        if (args.length >= 1) { // doesn't check whether bot is already streaming so !stream can be used to update what the bot is streaming, not just to toggle
          let msg = args[0];
          if (args.length >= 2) { // theres most likely a better and less clunky way to do this
            msg = '';
            for (let i = 1; i < args.length; i++) {
              msg = msg + args[i] + ' ';
            }
          }
          bot.setPresence({game: {name: msg, type: 1, url: 'https://www.twitch.tv/' + args[0]}});
          message.channel.send('Now streaming `https://www.twitch.tv/' + args[0] + '` with the message `' + msg + '`!');
          if (!isStreaming) {
            isStreaming = true;
          }
        } else {
          if (!isStreaming) {
            bot.setPresence({game: {name: 'whatever Amir\'s doing', type: 1, url: 'https://www.twitch.tv/speed__ow'}}); // default stream is Amir's twitch
            message.channel.send('Now streaming!');
          } else {
            bot.setPresence({game: {name: '!help'}});
            message.channel.send('Stopped streaming!');
          }
          isStreaming = !isStreaming;
        }
        break;
        */

      case 'arugula':
        message.channel.send('Broccoli');
        break;

      case 'help': // https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
        const helpEmbed = new Discord.MessageEmbed()
          .setColor(0x333333)
          .setTitle('Dashboard')
          .setDescription('My commands are:')
          .addFields(
        		{name: '!ping:', value: 'Gets latency'},
        		{name: '!say [message]:', value: 'Makes bot say what you tell it to say'},
        		{name: '!avatar @[user]:', value: 'Gets the discord avatar of the mentioned user, defaults to get your avatar when no user is mentioned'},
        		{name: '!purge [2-100]:', value: 'Bulk deletes the specified number of messages in the channel the command is called in'},
            {name: '!arugula:', value: 'funny broccoli haha'}
        	)
        message.channel.send(helpEmbed);
        break;

      case 'purge': // This command removes all messages from all users in the channel, up to 100.
        if (message.author.id == '355534246439419904') {
          // get the delete count, as an actual number.
          const deleteCount = parseInt(args[0], 10);

          if(!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

          const fetched = await message.channel.messages.fetch({limit: deleteCount});
          message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        }
        break;
    }
  }
});

client.login(auth.token);
