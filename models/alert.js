const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  message: { type: String, required: true },
  triggeredOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', alertSchema);
