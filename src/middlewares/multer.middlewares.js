import multer from "multer";
import fs from "fs";

// Ensure folder exists
const dir = './public/temp';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

export const upload = multer({ storage });
