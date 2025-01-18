/* eslint-disable no-undef */
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {    
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')); 
  },
});

export const upload = multer({ storage: storage });
