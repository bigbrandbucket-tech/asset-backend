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
  address: { type: String },

  // ✅ New fields
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Project', projectSchema);
