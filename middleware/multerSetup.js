const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folders exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

// Unified storage with dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others/';
    if (file.fieldname === 'image') folder = 'uploads/images/';
    else folder = 'uploads/documents/';
    
    createFolder(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix);
  }
});

// Optional: refine file filter if needed
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all file types for now
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
