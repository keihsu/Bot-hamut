const mongoose = require('mongoose');
const StaticSchema = new mongoose.Schema({
  discordServerId: { type: String, required: true },
  owner: { type: String },
  mods: [String],
  members: [String],
});

const StaticModel = (module.exports = mongoose.model('static', StaticSchema));
