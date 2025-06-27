const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    makeOrOEM: { type: String, required: true },
    assetName: { type: String, required: true },
    model: { type: String, required: true },
    tag: { type: String, required: true, unique: true },
    warrantyExpiryDate: { type: Date, required: true },
    alertRaised: { type: Boolean, default: false },

    gaDocumentUrl: { type: String, required: true },
    curveDocumentUrl: { type: String, required: true },
    performanceDocumentUrl: { type: String, required: true },
    sparesManualsUrl: { type: String, required: true },

    imageUrl: { type: String },

    location: {
      latitude: { type: String, required: true },
      longitude: { type: String, required: true },
    },

    associatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    // ✅ New field to store the QR Code URL or base64
    qrCodeUrl: { type: String } 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
