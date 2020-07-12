const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
//let isStreaming = false;

// Initialize Discord Bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //bot.setPresence({game: {name: '!help'}}); // sets status
});
client.on('message', message => {
  if (message.author.id != '684587440777986090') { // Bot ignores itself
    // Responses that are not commands
    if (message.content.toLowerCase().includes('incorrect')) { // toLowerCase makes this non case sensitive
      message.channel.send('Misleading and Wrong.'); // maybe too spammy?
    }

    // Bot listens to messages with the prefix !
    if (message.content.substring(0, 1) == '!') {
      var args = message.content.substring(1).split(' ');
      var cmd = args[0];

      args = args.splice(1); // removes cmd from the array, making the array contain only arguments to commands
      // Commands
      switch (cmd) {
        case 'ping':
          let ping = Date.now() - message.createdTimestamp; // returns NaN, still broken
          message.channel.send('<@!' + message.author.id + '>, your ping is `' + ping + ' ms`');
          break;

        case 'say':
          if (args.length > 0) {
            let msg = '';
            for (let i = 0; i < args.length; i++) {
              msg = msg + args[i] + ' ';
            }
            message.channel.send(msg);
          } else {
            message.channel.send('You must specify what to say!');
          }
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

        case 'help':
          message.channel.send({to: channelID, message: 'My commands are: \n **!ping:** pings you \n **!say [message]:** says what you tell it to say \n **!stream [twitch name] [displayed status]:** tells the bot to stream twitch.tv/[twitch name] with [displayed status]; if no argument is provided it defaults to plugging Amir\'s twitch \n **!arugula:** funny broccoli haha \n I also respond to anyone who dares use the word `incorrect` in their sentence.'});
          break;
        /*
        default:
          message.channel.send({to: channelID, message: 'Sorry, I didn\'t seem to get that.'});
        */
      }
    }
  }
});

client.login(auth.token);
