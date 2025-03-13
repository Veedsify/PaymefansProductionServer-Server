
const multer = require("multer");
const path = require("path");
const fs = require("fs")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("public/attachments/", { recursive: true })
    cb(null, "public/attachments/");
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-'); // Using ISO format and replacing colons
    const uniqueSuffix = req.user.user_id + "-" + timestamp + '-' + Math.round(Math.random() * 1E9); // Adding a random number for uniqueness
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensuring filename safety
  },
});

const upload = multer({ storage: storage });

module.exports = upload
