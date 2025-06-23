const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetName: { type: String, required: true },
    type: { type: String },
    tag: { type: String },
    service: { type: String },

    location: { type: String },
    repPhone: { type: String, match: /^\d{10}$/ },
    model: { type: String },
    makeOrOEM: { type: String },

    imageUrl: { type: String },
    gaDocumentUrl: { type: String },
    tdsDocumentUrl: { type: String },
    sparesManualsUrl: { type: String },

    // 🆕 Warranty fields
    warrantyExpiryDate: { type: Date, required: true },
    alertRaised: { type: Boolean, default: false },
    qrCodeUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
