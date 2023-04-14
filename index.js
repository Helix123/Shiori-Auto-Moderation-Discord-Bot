const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const keepAlive = require('./alive.js')
keepAlive()


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // ignore messages from other bots
  const member = message.member;
  const guild = message.guild;
  const badWords = ['fuck', 'sex', 'nigga', 'swine', 'bitch', 'motherfucker', 'mf', 'fk', 'bish', 'son of a bitch', 'LOL', 'FUCK', 'SEX', 'NIGGA', 'SWINE', 'BITCH', 'MOTHERFUCKER', 'MF', 'FK', 'BISH', 'women rights', 'cult', 'dumbass', 'dumbfuck', 'shit', 'shitting', 'fucking', 'bitching', 'nigger', 'NIGGER'];

   // Check for invite links
  const inviteRegex = /discord\.gg\/\w+/i;
  if (inviteRegex.test(message.content)) {
    // Delete the message
    message.delete();
    // Notify the member that their message was deleted
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained an invite link.`);
  }
  
  // Check for bad words
  if (badWords.some(word => message.content.toLowerCase().includes(word))) {
    // Delete the message
    message.delete();
    // Notify the member that their message was deleted
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained a bad word or illegal practices.`);
  }

  // Check for excessive caps
  const capsPercentage = message.content.replace(/[^A-Z]/g, '').length / message.content.length;
  if (capsPercentage > 0.5) {
    // Delete the message
    message.delete();
    // Notify the member that their message was deleted
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained too many capital letters.`);
  }

  // Check for excessive mentions
  const mentions = message.mentions.members.size + message.mentions.roles.size;
  if (mentions > 5) {
    // Delete the message
    message.delete();
    // Notify the member that their message was deleted
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained too many mentions.`);
  }
});

client.login('your bot token');
