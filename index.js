const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const keepAlive = require('./alive.js')
keepAlive()

// List of exempted channels
const exemptedChannels = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // ignore messages from other bots
  const member = message.member;
  const guild = message.guild;
  const badWords = ['fuck', 'sex', 'nigga', 'swine', 'bitch', 'motherfucker', 'mf', 'fk', 'bish', 'son of a bitch', 'FUCK', 'SEX', 'NIGGA', 'SWINE', 'BITCH', 'MOTHERFUCKER', 'MF', 'FK', 'BISH', 'women rights', 'cult', 'dumbass', 'dumbfuck', 'shit', 'shitting', 'fucking', 'bitching', 'nigger', 'NIGGER', 'fucker'];

  // Check if message was sent in exempted channel
  if (exemptedChannels.includes(message.channel.id)) {
    return;
  }

  // Rest of the moderation checks
  const inviteRegex = /discord\.gg\/\w+/i;
  if (inviteRegex.test(message.content)) {
    message.delete();
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained an invite link.`);
  }
  
  if (badWords.some(word => message.content.toLowerCase().includes(word))) {
    message.delete();
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained a bad word or illegal practices.`);
  }

  const capsPercentage = message.content.replace(/[^A-Z]/g, '').length / message.content.length;
  if (capsPercentage > 0.5) {
    message.delete();
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained too many capital letters.`);
  }

  const mentions = message.mentions.members.size + message.mentions.roles.size;
  if (mentions > 5) {
    message.delete();
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained too many mentions.`);
  }
});

// Command handler
const prefix = '!';

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'exempt') {
    // Check if user has permission to manage channels
    if (!message.member.permissions.has('MANAGE_CHANNELS')) {
      return message.reply('You do not have permission to manage channels.');
    }

    // Check if channel is already exempted
    if (exemptedChannels.includes(message.channel.id)) {
      exemptedChannels.splice(exemptedChannels.indexOf(message.channel.id), 1);
      return message.reply(`This channel is no longer exempted from moderation.`);
    }

    // Add channel to exempted channels list
    exemptedChannels.push(message.channel.id);
    message.reply(`This channel is now exempted from moderation.`);
  }
});

client.login('bot token');
