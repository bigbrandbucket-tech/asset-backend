const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },


  pocName: { type: String },
  pocNumber: {
    type: String,
    match: /^\d{10}$/
  },
  email: { type: String },
  address: { type: String }
});

module.exports = mongoose.model('Project', projectSchema);
