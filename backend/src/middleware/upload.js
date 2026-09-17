const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Files are stored with a UUID-based name on disk; the human-readable
// original filename and version number are tracked in the documents table.
// Swap this storage engine for an S3/MinIO multer-s3 adapter in production
// without touching the controller logic.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap for prototype
});

module.exports = { upload };
