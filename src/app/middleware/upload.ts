/* eslint-disable no-undef */
import multer from "multer";
import path from "path";
import fs from "fs";

// Create the uploads folder if it doesn't exist
const uploadPath = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Ensure this path is valid
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')); // Handle spaces in filenames
  },
});

export const upload = multer({ storage: storage });
