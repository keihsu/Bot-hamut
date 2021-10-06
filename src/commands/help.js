const Discord = require('discord.js');

const messages = {
  register:
    '**Description:** Create a new account using your Lodestone ID.\n\n**Syntax:** !register <Lodestone ID>\n\n**Note:** To find your Lodestone ID, visit https://finalfantasyxiv.com/lodestone/character/\nto search your character and view your profile.\nFrom the profile page, look at the URL. The numbers at the end will be your Lodestone ID.\n\n*Ex. https://na.finalfantasyxiv.com/lodestone/character/<Lodestone ID>*',
  profile:
    '**Description:** Retrieves your character information and displays your highest parses from FFLogs for the current Savage raid tier.',
  deleteuserdata:
    '**Description:** Deletes your user information, clears your loot table and removes you from any statics you are registered to.',
  additems:
    '**Description:** Adds one or more items that you need from the current raid tier to your personal loot table.\nInclude multiple times to add more than one of an item.\n\n**Syntax:** !additems<items(s) separated by spaces>\n\n**Available Items:** Weapon, Head, Body, Hands, Waist, Legs, Feet, Ears, Neck, Wrists, Ring, Dusting, Twine, Ester, Mount.\n\n**Example Usage:** !additems weapon body legs feet ears neck wrists ring dusting dusting twine twine',
  removeitems:
    '**Description:** Removes one or more items from your personal loot table.\nInclude multiple times to remove more than one of an item.\nItems not currently on your loot table are ignored.\n\n**Syntax:** !removeitems<items(s) separated by spaces>\n\n**Available Items:** Weapon, Head, Body, Hands, Waist, Legs, Feet, Ears, Neck, Wrists, Ring, Dusting, Twine, Ester, Mount.\n\n**Example Usage:** !removeitems body feet ears ring dusting',
  clearitems: '**Description:** Clears your personal loot table.',
  viewitems: '**Description:** Displays your personal loot table.',
  createStatic:
    '**Description:** Creates a static in the current Discord server. Currently only one static is allowed per Discord Server. The user who executes the command will be the static owner.',
  deleteStatic:
    '**Description:** Deletes the static from the current Discord server. Only the owner can delete the static.',
  addmember:
    '**Description:** Adds a member to the static.\n\n**Syntax:** !addmember <@Username>\n\n**Note:** Make sure the user is tagged in the command.',
  kickmember:
    '**Description:** Removes a member from the static.\n\n**Syntax:** !kickmember <@Username>\n\n**Note:** Make sure the user is tagged in the command.',
  leavestatic: '**Description:** Remove yourself from the static.',
  transferowner:
    '**Description:** Transfers ownership of the static to another member.\n\n**Syntax:** !transferowner <@Username>\n\n**Note:** Make sure the new owner is tagged in the command and already in the static.',
  loottable:
    '**Description:** Displays the loot table for all members in the static.',
};

const helpMessage = (message, ...args) => {
  if (args.length === 0) {
    return message.channel.send(
      'Use **!commands** for a full list of commands or\n**!help <command>** to get help with a specific command.',
    );
  } else if (args[0] in messages) {
    return message.channel.send(messages[args[0]]);
  }
  return message.channel.send('No help available for this command.');
};

const commands = (message) => {
  const profileEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Bot-Hamut Commands')
    .setDescription('Use !help <command> to get help with a specific command.')
    .addFields(
      {
        name: 'Profile Commands',
        value:
          '•register\n•deleteuserdata\n•profile\n•additems\n•removeitems\n•clearitems\n•viewitems',
        inline: true,
      },
      {
        name: 'Static Commands',
        value:
          '•createstatic\n•deletestatic\n•addmember\n•kickmember\n•leavestatic\n•transferowner\n•loottable\n',
        inline: true,
      },
    );

  return message.channel.send(profileEmbed);
};
module.exports = { helpMessage, commands };
