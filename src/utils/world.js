const REGIONS = {
  Aether: 'NA',
  Primal: 'NA',
  Crystal: 'NA',
  Chaos: 'EU',
  Light: 'EU',
  Elemental: 'JP',
  Gaia: 'JP',
  Mana: 'JP',
};

const WORLDS = {
  Adamantoise: 'Aether',
  Cactaur: 'Aether',
  Faerie: 'Aether',
  Gilgamesh: 'Aether',
  Jenova: 'Aether',
  Midgardsormr: 'Aether',
  Sargatanas: 'Aether',
  Siren: 'Aether',
  Behemoth: 'Primal',
  Excalibur: 'Primal',
  Exodus: 'Primal',
  Famfrit: 'Primal',
  Hyperion: 'Primal',
  Lamia: 'Primal',
  Leviathan: 'Primal',
  Ultros: 'Primal',
  Balmung: 'Crystal',
  Brynhildr: 'Crystal',
  Coeurl: 'Crystal',
  Diabolos: 'Crystal',
  Goblin: 'Crystal',
  Malboro: 'Crystal',
  Mateus: 'Crystal',
  Zalera: 'Crystal',
  Cerberus: 'Chaos',
  Louisoix: 'Chaos',
  Moogle: 'Chaos',
  Omega: 'Chaos',
  Ragnarok: 'Chaos',
  Lich: 'Light',
  Odin: 'Light',
  Phoenix: 'Light',
  Shiva: 'Light',
  Zodiark: 'Light',
  Aegis: 'Elemental',
  Atomos: 'Elemental',
  Carbuncle: 'Elemental',
  Garuda: 'Elemental',
  Gungnir: 'Elemental',
  Kujata: 'Elemental',
  Ramuh: 'Elemental',
  Tonberry: 'Elemental',
  Typhon: 'Elemental',
  Unicorn: 'Elemental',
  Alexander: 'Gaia',
  Bahamut: 'Gaia',
  Durandal: 'Gaia',
  Fenrir: 'Gaia',
  Ifrit: 'Gaia',
  Ridill: 'Gaia',
  Tiamat: 'Gaia',
  Ultima: 'Gaia',
  Valefor: 'Gaia',
  Yojimbo: 'Gaia',
  Zeromus: 'Gaia',
  Anima: 'Mana',
  Asura: 'Mana',
  Belias: 'Mana',
  Chocobo: 'Mana',
  Hades: 'Mana',
  Ixion: 'Mana',
  Mandragora: 'Mana',
  Masamune: 'Mana',
  Pandemonium: 'Mana',
  Shinryu: 'Mana',
  Titan: 'Mana',
};

const isWorld = (world) => {
  if (WORLDS[world]) {
    return true;
  }
  return false;
};

const getDataCenter = (world) => {
  return WORLDS[world];
};

const getRegion = (dataCenter) => {
  return REGIONS[dataCenter];
};

module.exports = { isWorld, getRegion, getDataCenter };
