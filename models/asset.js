const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },                     // Electrical, HVAC, etc.
    makeOrOEM: { type: String, required: true },                // Manufacturer
    assetName: { type: String, required: true },                // Equipment Name
    model: { type: String, required: true },                    // Model
    tag: { type: String, required: true, unique: true },        // Equipment Number

    warrantyExpiryDate: { type: Date, required: true },         // Warranty
    alertRaised: { type: Boolean, default: false },             // Alert tracking

    gaDocumentUrl: { type: String, required: true },            // GA Drawing
    curveDocumentUrl: { type: String, required: true },         // Curve
    performanceDocumentUrl: { type: String, required: true },   // Performance
    sparesManualsUrl: { type: String, required: true },         // Spares & Manuals

    imageUrl: { type: String },                                 // ✅ Optional

    location: {
      latitude: { type: String, required: true },
      longitude: { type: String, required: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
