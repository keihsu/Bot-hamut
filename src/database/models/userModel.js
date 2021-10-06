const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  discordUserId: { type: String, required: true },
  lodestoneId: { type: Number, required: true },
  charName: { type: String, required: true },
  region: { type: String, required: true },
  dataCenter: { type: String, required: true },
  world: { type: String, required: true },
  statics: [String],
  wishlist: { type: Map, of: Number },
  //emojiRoleMappings: {type: mongoose.Schema.Types.Mixed}
});

const UserModel = (module.exports = mongoose.model('user', UserSchema));
