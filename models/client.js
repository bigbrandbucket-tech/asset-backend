const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  pocName: { type: String, required: true },
  pocNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  email: { type: String, required: true },
  address: { type: String }
});

module.exports = mongoose.model('Client', clientSchema);
