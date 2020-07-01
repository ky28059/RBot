const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');

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
  bot.setPresence({game: {name: "!help"}}); // sets status
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
          let ping = Date.now() - message.createdTimestamp + " ms";
          bot.sendMessage({
            to: channelID,
            message: '<@!' + userID + '>, your ping is `' + ping + '`'
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

        case 'arugula':
          bot.sendMessage({
            to: channelID,
            message: 'Broccoli'
          });
          break;

        case 'help':
          bot.sendMessage({
            to: channelID,
            message: 'My commands are: \n **!ping:** pings you \n **!say:** says what you tell it to say \n **!arugula:** funny broccoli haha \n I also respond to anyone who dares use the word `incorrect` in their sentence.'
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
