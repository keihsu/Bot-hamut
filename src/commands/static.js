const StaticModel = require('../database/models/staticModel');
const UserModel = require('../database/models/userModel');
const Discord = require('discord.js');
const ProfileCommands = require('./profile');
const { STATUS } = require('../utils/status');
const { table } = require('table');

const createStatic = async (message) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else if (await StaticModel.exists({ discordServerId: message.guild.id })) {
    return message.channel.send(STATUS.STATIC_ALREADY_EXISTS);
  } else {
    let static = new StaticModel({
      discordServerId: message.guild.id,
      owner: message.author.id,
      mods: [],
      members: [message.author.id],
    }).save();

    const userDocs = await UserModel.find({ discordUserId: message.author.id });
    userDocs[0]['statics'].push(message.guild.id);
    await userDocs[0].save();

    return message.channel.send(STATUS.STATIC_CREATE_SUCCESS);
  }
};

const deleteStatic = async (message) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else if (
    !(await StaticModel.exists({ discordServerId: message.guild.id }))
  ) {
    return message.channel.send(STATUS.STATIC_NOT_EXIST);
  } else {
    const docs = await StaticModel.find({ discordServerId: message.guild.id });
    if (docs[0]['owner'] !== message.author.id) {
      return message.channel.send(STATUS.STATIC_NOT_OWNER);
    }
    for (var i = 0; i < docs[0]['members'].length; i++) {
      //console.log(docs[0]['members'][i]);
      const userDocs = await UserModel.find({
        discordUserId: docs[0]['members'][i],
      });
      const staticInd = userDocs[0]['statics'].indexOf(message.guild.id);
      userDocs[0]['statics'].splice(staticInd, 1);
      await userDocs[0].save();
    }

    await StaticModel.deleteMany(
      { discordServerId: message.guild.id },
      (err) => {
        if (err) {
          message.channel.send(STATUS.STATIC_DELETE_FAIL);
        }
      },
    );
    message.channel.send(STATUS.STATIC_DELETE_SUCCESS);
  }
};

const getMembers = async (message) => {
  const docs = await StaticModel.find({ discordServerId: message.guild.id });
  console.log(docs[0]['members']);
};

const addMember = async (message, ...args) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else {
    const memberID = args[0].replace(/\D/g, '');
    const docs = await StaticModel.find({ discordServerId: message.guild.id });
    if (message.author.id !== docs[0]['owner']) {
      return message.channel.send(
        'You do not have permission to add/remove members from the static.',
      );
    }
    if (docs[0]['members'].indexOf(memberID) >= 0) {
      return message.channel.send(args[0] + ' is already in the static.');
    }
    docs[0]['members'].push(memberID);
    await docs[0].save();

    const userDocs = await UserModel.find({ discordUserId: memberID });
    userDocs[0]['statics'].push(message.guild.id);
    await userDocs[0].save();

    message.channel.send(args[0] + ' has joined the static.');
  }
};

const kickMember = async (message, ...args) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else {
    const memberID = args[0].replace(/\D/g, '');
    const docs = await StaticModel.find({ discordServerId: message.guild.id });
    if (message.author.id !== docs[0]['owner']) {
      return message.channel.send(
        'You do not have permission to add/remove members from the static.',
      );
    }
    if (memberID === docs[0]['owner']) {
      return message.channel.send(
        'You cannot kick yourself from the static.\nPlease assign another owner or delete the static.',
      );
    }
    const ind = docs[0]['members'].indexOf(memberID);
    if (ind < 0) {
      return message.channel.send(args[0] + ' is not in the static.');
    }
    docs[0]['members'].splice(ind, 1);
    await docs[0].save();

    const userDocs = await UserModel.find({ discordUserId: memberID });
    const staticInd = userDocs[0]['statics'].indexOf(message.guild.id);
    userDocs[0]['statics'].splice(staticInd, 1);
    await userDocs[0].save();

    message.channel.send(args[0] + ' has been removed from the static.');
  }
};

const leaveStatic = async (message) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }

  const docs = await StaticModel.find({ discordServerId: message.guild.id });

  if (message.author.id === docs[0]['owner']) {
    return message.channel.send(
      'You are the owner.\nPlease assign another owner before leaving or delete the static.',
    );
  }
  const ind = docs[0]['members'].indexOf(message.author.id);
  if (ind < 0) {
    return message.channel.send('You are not in the static.');
  }
  docs[0]['members'].splice(ind, 1);
  await docs[0].save();

  const userDocs = await UserModel.find({ discordUserId: message.author.id });
  const staticInd = userDocs[0]['statics'].indexOf(message.guild.id);
  userDocs[0]['statics'].splice(staticInd, 1);
  await userDocs[0].save();

  message.channel.send(args[0] + ' has left the static.');
};

const transferOwner = async (message, ...args) => {
  if (!message.guild.id) {
    return message.channel.send(STATUS.NOT_IN_SERVER);
  } else if (!(await ProfileCommands.isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else if (args.length != 1) {
    return message.channel.send(STATUS.TRANSFER_INVALID_ARGS);
  }
  const memberID = args[0].replace(/\D/g, '');
  const docs = await StaticModel.find({ discordServerId: message.guild.id });
  if (message.author.id !== docs[0]['owner']) {
    return message.channel.send('You are not the owner of the static.');
  }
  if (docs[0]['members'].indexOf(memberID) < 0) {
    return message.channel.send(
      `Please add ${args[0]} to the static before transferring ownership.`,
    );
  }
  docs[0]['owner'] = memberID;
  await docs[0].save();

  message.channel.send(
    'Ownership of the static has been transferred to ' + args[0],
  );
};

const printLootTable = async (message) => {
  if (!(await StaticModel.exists({ discordServerId: message.guild.id }))) {
    return message.channel.send(STATUS.STATIC_NOT_EXIST);
  }
  const docs = await StaticModel.find({ discordServerId: message.guild.id });
  const data = [['Name', 'E9S', 'E10S', 'E11S', 'E12S']];
  for (var i = 0; i < docs[0]['members'].length; i++) {
    data.push(await ProfileCommands.getItems(docs[0]['members'][i]));
  }
  let outputStr = table(data);
  let outputQueue = outputStr.split('\n');
  let output = '';
  for (var i = 0; i < outputQueue.length; i++) {
    output = output + '\n' + outputQueue[i];
    if ((i + 1) % 23 === 0) {
      message.channel.send('```\n' + output + '\n```');
      output = '';
    }
  }
  if (output != '') {
    return message.channel.send('```\n' + output + '\n```');
  }
  //return message.channel.send(`\`\`\`${output}\`\`\``);
};

module.exports = {
  createStatic,
  deleteStatic,
  getMembers,
  addMember,
  kickMember,
  leaveStatic,
  transferOwner,
  printLootTable,
};
