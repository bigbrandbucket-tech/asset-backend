const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String },
  phone: {
    type: String,
    match: /^\d{10}$/
  },
  role: { type: String },
  assignedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' } // one-to-one
});

module.exports = mongoose.model('User', userSchema);
