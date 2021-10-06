const World = require('../utils/world');
const UserModel = require('../database/models/userModel');
const StaticModel = require('../database/models/staticModel');
const Discord = require('discord.js');
const cheerio = require('cheerio');
const got = require('got');
const { table } = require('table');
const { STATUS } = require('../utils/status');
const LODESTONE_URL = 'https://na.finalfantasyxiv.com/lodestone/character/';
const FFLOGS_URL = 'https://www.fflogs.com/character/';
const FFLOGS_RANKING = 'https://www.fflogs.com:443/v1/rankings/character/';
const FFLOGS_REPORT = 'https://www.fflogs.com/reports/';

const isUser = async (id) => {
  return await UserModel.exists({ discordUserId: id });
};

const printUserInfo = async (message, api_key) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }
  const docs = await UserModel.find({ discordUserId: message.author.id }, (err) => {
    if (err) {
      console.log('printUserInfo:' + err);
    }
  });

  //console.log(docs[0]);
  const targetUrl = `${LODESTONE_URL}${docs[0].lodestoneId}/`;
  await got(targetUrl)
    .then(async (response) => {
      const $ = cheerio.load(response.body);
      const thumbnailUrl = $('.frame__chara__face').find('img').attr('src');
      const portraitUrl = $('.js__image_popup').find('img').attr('src');
      const charName = $('.frame__chara__name').text().replace(/\s/g, ' ');
      const playerTitle = $('.frame__chara__title').text();
      const location = $('.frame__chara__world')
        .text()
        .replace(/[)(]/g, '')
        .split(/\s/g);
      const world = location[0];
      const dataCenter = location[1];
      const region = World.getRegion(dataCenter);
      const fflogsUrl = `${FFLOGS_URL}${region}/${world}/${charName.replace(
        ' ',
        '%20',
      )}`;
      if(docs[0].charName !== charName){
          docs[0].charName = charName;
          await docs[0].save();
      }
      const encounters = [];
      const percentiles = [];
      const rdps = [];

      for (var i = 73; i <= 77; i++) {
        const result = await got(
          `${FFLOGS_RANKING}${charName.replace(
            ' ',
            '%20',
          )}/${world}/${region}?encounter=${i}&metric=rdps&api_key=${api_key}`,
        ).json();
        if (result.length > 0 && result[0]['difficulty'] == 101) {
          encounters.push(
            `[${result[0]['encounterName']}](${FFLOGS_REPORT}${result[0]['reportID']}#fight=last)`,
          );
          percentiles.push(Math.trunc(result[0]['percentile']));
          rdps.push(Math.round(result[0]['total']));
        }
      }
      const profileEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        //.setAuthor(playerTitle)
        .setTitle(docs[0].charName)
        .setURL(targetUrl)
        .setDescription(`[View FFLogs Profile](${fflogsUrl})`)
        .addFields(
          {
            name: 'Home World:',
            value: `${world} (${dataCenter})`,
            inline: true,
          },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
        )
        .setThumbnail(thumbnailUrl);
      //.setImage(portraitUrl);
      if (encounters.length > 0) {
        profileEmbed.addFields(
          {
            name: 'Boss',
            value: encounters.join('\n'),
            inline: true,
          },
          {
            name: 'Best %',
            value: percentiles.join('\n'),
            inline: true,
          },
          {
            name: 'Highest rDPS',
            value: rdps.join('\n'),
            inline: true,
          },
        );
      } else {
        profileEmbed.addField('No parse history for current raid tier.', '\u200B', false);
      }
      profileEmbed.setTimestamp();

      message.channel.send(profileEmbed);
    })
    .catch((err) => {
      message.channel.send(STATUS.UNEXPECTED_ERROR);
      console.log('printUserInfo: ' + err);
    });
};

const newUser = async (message, ...args) => {
  if (args.length != 1) {
    message.channel.send(STATUS.USER_CREATE_INVALID_ARGS);
  } else if (await isUser(message.author.id)) {
    message.channel.send(STATUS.USER_ALREADY_EXISTS);
  } else {
    const lodestoneId = args[0];
    const targetUrl = `${LODESTONE_URL}${lodestoneId}/`;
    got(targetUrl)
      .then((response) => {
        const $ = cheerio.load(response.body);
        const charName = $('.frame__chara__name').text().replace(/\s/g, ' ');
        const location = $('.frame__chara__world')
          .text()
          .replace(/[)(]/g, '')
          .split(/\s/g);
        const world = location[0];
        const dataCenter = location[1];

        let user = new UserModel({
          discordUserId: message.author.id,
          lodestoneId: lodestoneId,
          charName: charName,
          region: World.getRegion(dataCenter),
          dataCenter: dataCenter,
          world: world,
          statics: [],
          wishlist: {
            Weapon: 0,
            Head: 0,
            Body: 0,
            Hands: 0,
            Waist: 0,
            Legs: 0,
            Feet: 0,
            Ears: 0,
            Neck: 0,
            Wrists: 0,
            Ring: 0,
            Dusting: 0,
            Twine: 0,
            Ester: 0,
            Mount: 0,
            Tomestone: 0,
          },
        }).save();
        message.channel.send(STATUS.USER_CREATE_SUCCESS);
      })
      .catch((err) => {
        message.channel.send(STATUS.INVALID_LODESTONE_ID);
        console.log('newUser: ' + err);
      });
  }
};

const deleteUser = async (message) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }
  const docs = await UserModel.find({ discordUserId: message.author.id });
  //console.log(docs[0]);
  while (docs[0]['statics'].length > 0) {
    const staticId = docs[0]['statics'].shift();
    //console.log(staticId);
    const staticDocs = await StaticModel.find({
      discordServerId: staticId,
    });
    //console.log(staticDocs);
    if (staticDocs[0]['owner'] === message.author.id) {
      for (var j = 0; j < staticDocs[0]['members'].length; j++) {
        const userDocs = await UserModel.find({
          discordUserId: staticDocs[0]['members'][j],
        });
        const staticInd = userDocs[0]['statics'].indexOf(
          staticDocs[0]['discordServerId'],
        );
        userDocs[0]['statics'].splice(staticInd, 1);
        await userDocs[0].save();

        await StaticModel.deleteMany(
          { discordServerId: message.guild.id },
          (err) => {
            if (err) {
              console.log('deleteUser: ' + err);
            }
          },
        );
      }
    } else {
      const memberInd = staticDocs[0]['members'].indexOf(message.author.id);
      staticDocs[0]['members'].splice(memberInd, 1);
      await staticDocs[0].save();
    }
  }

  await UserModel.deleteMany({ discordUserId: message.author.id }, (err) => {
    if (err) {
      message.channel.send(STATUS.USER_DELETE_FAIL);
    }
  });
  message.channel.send(STATUS.USER_DELETE_SUCCESS);
};

const getUser = async (message, api_key) => {
  await UserModel.find({ discordUserId: message.author.id }, (err, docs) => {
    if (err) {
      console.log('getUser:' + err);
    } else {
      printUserInfo(message, docs[0], api_key);
    }
  });
};

const test = async (message) => {
  const result = await got(
    `https://www.fflogs.com:443/v1/rankings/character/garlic%20pepper/diabolos/na?encounter=76&metric=rdps&api_key=01392245a6f2a7a460747b28c25b704b`,
  ).json();
  //console.log(result.length['total']);
};

const addItems = async (message, ...args) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else if (args.length <= 0) {
    message.channel.send(STATUS.ITEM_ADD_INVALID_ARGS);
  } else {
    await UserModel.find(
      { discordUserId: message.author.id },
      async (err, docs) => {
        if (err) {
          console.log('addItems:' + err);
        } else {
          let notFound = [];
          for (var i = 0; i < args.length; i++) {
            const item =
              args[i].charAt(0).toUpperCase() + args[i].toLowerCase().slice(1);
            if (docs[0]['wishlist'].has(item)) {
              docs[0]['wishlist'].set(item, docs[0]['wishlist'].get(item) + 1);
            } else {
              notFound.push(args[i]);
            }
          }
          await docs[0].save();
          if (notFound.length === 0) {
            return message.channel.send(STATUS.ITEM_ADD_SUCCESS);
          } else {
            return message.channel.send(
              'The following items were unable to be added: ' +
              notFound.join(', ') +
              '\nPlease check spelling.',
            );
          }
        }
      },
    );
  }
};

const removeItems = async (message, ...args) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  } else if (args.length <= 0) {
    message.channel.send(STATUS.ITEM_ADD_INVALID_ARGS);
  } else {
    await UserModel.find(
      { discordUserId: message.author.id },
      async (err, docs) => {
        if (err) {
          console.log('addItems:' + err);
        } else {
          let notFound = [];
          for (var i = 0; i < args.length; i++) {
            const item =
              args[i].charAt(0).toUpperCase() + args[i].toLowerCase().slice(1);
            if (
              docs[0]['wishlist'].has(item) &&
              docs[0]['wishlist'].get(item) > 0
            ) {
              docs[0]['wishlist'].set(item, docs[0]['wishlist'].get(item) - 1);
            } else if (!docs[0]['wishlist'].has(item)) {
              notFound.push(args[i]);
            }
          }
          await docs[0].save();
          if (notFound.length === 0) {
            return message.channel.send(STATUS.ITEM_REMOVE_SUCCESS);
          } else {
            return message.channel.send(
              'The following items were unable to be removed: ' +
              notFound.join(', ') +
              '\nPlease check spelling.',
            );
          }
        }
      },
    );
  }
};

const clearItems = async (message) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }
  await UserModel.find(
    { discordUserId: message.author.id },
    async (err, docs) => {
      if (err) {
        console.log('clearItems:' + err);
      } else {
        for (let [key, value] of docs[0]['wishlist']) {
          docs[0]['wishlist'].set(key, 0);
        }
        await docs[0].save();
        return message.channel.send('Items cleared.');
      }
    },
  );
};

const getItems = async (id) => {
  if (!(await isUser(id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }
  const docs = await UserModel.find({ discordUserId: id }, async (err) => {
    if (err) {
      console.log('addItems:' + err);
    }
  });
  const wishlist = docs[0]['wishlist'];
  const stringArr = [[], [], [], []];
  const result = [];
  for (let [key, value] of wishlist) {
    if (value > 0) {
      if (['Waist', 'Ears', 'Neck', 'Wrists', 'Ring'].indexOf(key) > -1) {
        if (value === 1) {
          stringArr[0].push(key);
        } else {
          stringArr[0].push(`${key} (x${value})`);
        }
      }
      if (['Head', 'Hands', 'Feet', 'Dusting', 'Tomestone'].indexOf(key) > -1) {
        if (value === 1) {
          stringArr[1].push(key);
        } else {
          stringArr[1].push(`${key} (x${value})`);
        }
      }
      if (
        ['Head', 'Hands', 'Legs', 'Feet', 'Twine', 'Ester'].indexOf(key) > -1
      ) {
        if (value === 1) {
          stringArr[2].push(key);
        } else {
          stringArr[2].push(`${key} (x${value})`);
        }
      }
      if (['Weapon', 'Body', 'Mount'].indexOf(key) > -1) {
        if (value === 1) {
          stringArr[3].push(key);
        } else {
          stringArr[3].push(`${key} (x${value})`);
        }
      }
    }
  }
  result.push(docs[0]['charName']);
  for (var i = 0; i < stringArr.length; i++) {
    result.push(stringArr[i].join('\n'));
  }
  return result;
};

const printItems = async (message) => {
  if (!(await isUser(message.author.id))) {
    return message.channel.send(STATUS.USER_NOT_REGISTERED);
  }
  let header = ['Name', 'E9S', 'E10S', 'E11S', 'E12S'];
  let data = [header, await getItems(message.author.id)];
  let output = table(data);
  //console.log(output.length);
  return message.channel.send(`\`\`\`${output}\`\`\``);
};

module.exports = {
  isUser,
  printUserInfo,
  test,
  newUser,
  getUser,
  deleteUser,
  addItems,
  removeItems,
  clearItems,
  getItems,
  printItems,
};
