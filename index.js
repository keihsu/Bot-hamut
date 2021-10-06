require('dotenv').config();

const { Client } = require('discord.js');
const client = new Client({
  partials: ['MESSAGE', 'REACTION'],
});
const Database = require('./src/database/database');
const World = require('./src/utils/world');
const { STATUS } = require('./src/utils/status');
const Discord = require('discord.js');
const UserModel = require('./src/database/models/userModel');
const StaticModel = require('./src/database/models/staticModel');
const ProfileCommands = require('./src/commands/profile');
const StaticCommands = require('./src/commands/static');
const HelpCommands = require('./src/commands/help');
const PREFIX = process.env.PREFIX;

client.on('ready', async () => {
  console.log(`${client.user.username} successfully logged in.`);
  client.user.setActivity('FFXIV | !commands');
  Database.then(() => console.log('Connected to MongoDB.')).catch((err) =>
    console.log(err),
  );
});

client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const [CMD, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD === 'register') {
      await ProfileCommands.newUser(message, ...args);
    } else if (CMD === 'deleteuserdata') {
      await ProfileCommands.deleteUser(message);
    } else if (CMD === 'profile') {
      await ProfileCommands.printUserInfo(message, process.env.FFLOGS_KEY);
      // } else if (CMD === 'test') {
      //   ProfileCommands.test(message);
    } else if (CMD === 'additems') {
      ProfileCommands.addItems(message, ...args);
    } else if (CMD === 'removeitems') {
      ProfileCommands.removeItems(message, ...args);
    } else if (CMD === 'clearitems') {
      ProfileCommands.clearItems(message);
    } else if (CMD === 'viewitems') {
      ProfileCommands.printItems(message);
    } else if (CMD === 'createstatic') {
      StaticCommands.createStatic(message);
    } else if (CMD === 'deletestatic') {
      StaticCommands.deleteStatic(message);
    } else if (CMD === 'addmember') {
      StaticCommands.addMember(message, ...args);
    } else if (CMD === 'kickmember') {
      StaticCommands.kickMember(message, ...args);
    } else if (CMD === 'leavestatic') {
      StaticCommands.leaveStatic(message);
    } else if (CMD === 'transferowner') {
      StaticCommands.transferOwner(message, ...args);
      // } else if (CMD === 'viewmembers') {
      //   StaticCommands.getMembers(message);
    } else if (CMD === 'loottable') {
      StaticCommands.printLootTable(message);
    } else if (CMD === 'help') {
      HelpCommands.helpMessage(message, ...args);
    } else if (CMD === 'commands') {
      HelpCommands.commands(message);
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  console.log('here');
  const docs = await StaticModel.find({ discordServerId: member.guild.id });

  if (member.id === docs[0]['owner']) {
    //delete static
    for (var i = 0; i < docs[0]['members'].length; i++) {
      const userDocs = await UserModel.find({
        discordUserId: docs[0]['members'][i],
      });
      const staticInd = userDocs[0]['statics'].indexOf(member.guild.id);
      userDocs[0]['statics'].splice(staticInd, 1);
      await userDocs[0].save();
    }
    await StaticModel.deleteMany(
      { discordServerId: message.guild.id },
      (err) => {
        if (err) {
          console.log('User Leave Server: ' + err);
        }
      },
    );
  } else {
    const ind = docs[0]['members'].indexOf(message.author.id);
    if (ind >= 0) {
      docs[0]['members'].splice(ind, 1);
      await docs[0].save();
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
