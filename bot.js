const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
let isStreaming = false;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
  bot.setPresence({game: {name: '!help'}}); // sets status
});
bot.on('message', function (user, userID, channelID, message, evt) {
  if (userID != '684587440777986090') { // Bot ignores itself
    // Responses that are not commands
    if (message.toLowerCase().includes('incorrect')) { // toLowerCase makes this non case sensitive
      bot.sendMessage({
        to: channelID,
        message: 'Misleading and Wrong.' // maybe too spammy?
      });
    }

    // Bot listens to messages with the prefix !
    if (message.substring(0, 1) == '!') {
      var args = message.substring(1).split(' ');
      var cmd = args[0];

      args = args.splice(1); // removes cmd from the array, making the array contain only arguments to commands
      // Commands
      switch (cmd) {
        case 'ping':
          let ping = Date.now() - message.createdTimestamp; // returns NaN, still broken
          bot.sendMessage({
            to: channelID,
            message: '<@!' + userID + '>, your ping is `' + ping + ' ms`'
          });
          break;

        case 'say':
          if (args.length > 0) {
            let msg = '';
            for (let i = 0; i < args.length; i++) {
              msg = msg + args[i] + ' ';
            }
            bot.sendMessage({
              to: channelID,
              message: msg
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: 'You must specify what to say!'
            });
          }
          break;

        case 'stream': // streaming lol
          if (args.length == 1) { // doesn't check whether bot is already streaming so !stream can be used to update what the bot is streaming, not just to toggle
            bot.setPresence({game: {name: args[0], type: 1, url: 'https://www.twitch.tv/' + args[0]}});
            bot.sendMessage({
              to: channelID,
              message: 'Now streaming ' + args[0] + '!'
            });
            if (!isStreaming) {
              isStreaming = true;
            }
          } else {
            if (!isStreaming) {
              bot.setPresence({game: {name: 'whatever Amir\'s doing', type: 1, url: 'https://www.twitch.tv/speed__ow'}}); // default stream is Amir's twitch
              bot.sendMessage({
                to: channelID,
                message: 'Now streaming!'
              });
            } else {
              bot.setPresence({game: {name: '!help'}});
              bot.sendMessage({
                to: channelID,
                message: 'Stopped streaming!'
              });
            }
            isStreaming = !isStreaming;
          }
          break;

        case 'arugula':
          bot.sendMessage({
            to: channelID,
            message: 'Broccoli'
          });
          break;

        case 'help':
          bot.sendMessage({
            to: channelID,
            message: 'My commands are: \n **!ping:** pings you \n **!say [message]:** says what you tell it to say \n **!stream [twitch name]:** tells the bot to stream twitch.tv/[twitch name]; if no argument is provided it defaults to plugging Amir\'s twitch \n **!arugula:** funny broccoli haha \n I also respond to anyone who dares use the word `incorrect` in their sentence.'
          });
          break;
        /*
        default:
          bot.sendMessage({
            to: channelID,
            message: 'Sorry, I didn\'t seem to get that.'
          });
        */
      }
    }
  }
});
