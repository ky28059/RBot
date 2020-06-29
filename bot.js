var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
  // Responses that are not commands
  if (message == 'Incorrect.') {
    bot.sendMessage({
      to: channelID,
      message: 'Misleading and Wrong.'
    });
  }

  // Bot listens to messages with the prefix !
  if (message.substring(0, 1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1); //removes cmd from the array, making the array contain only arguments
    // Commands
    switch (cmd) {
      case 'ping':
        bot.sendMessage({
          to: channelID,
          message: '<@!' + userID + '>'
        });
        break;

      case 'say':
        if (args.length > 0) {
          let msg = '';
          for (var i = 0; i < args.length; i++) {
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
          message: 'My commands are: \n **!ping:** pings you \n **!say:** says what you tell it to say \n **!arugula:** funny broccoli haha'
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
});
