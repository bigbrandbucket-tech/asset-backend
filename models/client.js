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
  address: { type: String },
  
  // ✅ Add these fields for login
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Will be hashed with bcrypt
});

module.exports = mongoose.model('Client', clientSchema);
