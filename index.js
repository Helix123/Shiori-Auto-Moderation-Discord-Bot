const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const keepAlive = require('./alive.js')
keepAlive()

const fs = require('fs');


// List of exempted channels
let exemptedChannels = [];
if (fs.existsSync('./exempted-channels.json')) {
  const data = fs.readFileSync('./exempted-channels.json', 'utf8');
  exemptedChannels = JSON.parse(data);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.application.commands.create({
    name: 'exempt',
    description: 'Free channel from moderation',
  });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // ignore messages from other bots
  const member = message.member;
  const guild = message.guild;
  const badWords = ['fuck', 'sex', 'nigga', 'swine', 'bitch', 'motherfucker', 'mf', 'fk', 'bish', 'son of a bitch', 'FUCK', 'SEX', 'NIGGA', 'SWINE', 'BITCH', 'MOTHERFUCKER', 'MF', 'FK', 'BISH', 'women rights', 'cult', 'dumbass', 'dumbfuck', 'shit', 'shitting', 'fucking', 'bitching', 'nigger', 'NIGGER', 'fucker', 'asshole', 'asskisser', 'bastard', 'bimbo', 'dickhead', 'dork', 'dweeb', 'geezer', 'slut', 'hoe', 'jerk', 'pussy', 'kike', 'klutz', 'meathead', 'lardass', 'limey', 'pig', 'wog', 'wop', 'ass-kisser', 'ass'];

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

   // Check for NSFW links
  const nsfwRegex = /(pornhub|xvideos|xnxx|redtube|youporn|nhentai|hanime|hentaimama|xhamster|hentaihaven|nutaku|brazzers|rule34video)\.(com|tv)/i;
  if (nsfwRegex.test(message.content)) {
    message.delete();
    member.send(`Sorry, your message in ${guild.name} was deleted because it contained an NSFW link.`);
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

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() || interaction.user.bot) return;

  const command = interaction.commandName;

  if (command === 'exempt') {
    // Check if user has permission to manage channels
    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({ content: 'You do not have permission to manage channels.', ephemeral: true });
    }

    // Check if channel is already exempted
    if (exemptedChannels.includes(interaction.channel.id)) {
      exemptedChannels.splice(exemptedChannels.indexOf(interaction.channel.id), 1);
      fs.writeFileSync('./exempted-channels.json', JSON.stringify(exemptedChannels));
      return interaction.reply({ content: `This channel is no longer exempted from moderation.`, ephemeral: true });
    }

    // Add channel to exempted channels list
    exemptedChannels.push(interaction.channel.id);
    fs.writeFileSync('./exempted-channels.json', JSON.stringify(exemptedChannels));
    interaction.reply({ content: `This channel is now exempted from moderation.`, ephemeral: true });
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
      fs.writeFileSync('./exempted-channels.json', JSON.stringify(exemptedChannels));
      return message.reply(`This channel is no longer exempted from moderation.`);
    }

    // Add channel to exempted channels list
    exemptedChannels.push(message.channel.id);
    fs.writeFileSync('./exempted-channels.json', JSON.stringify(exemptedChannels));
    message.reply(`This channel is now exempted from moderation.`);
  }
});

client.login('token here');
