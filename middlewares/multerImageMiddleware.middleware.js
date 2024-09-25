const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage({
  // destination: (req, file, cb) => {
  //   fs.mkdirSync("public/images/uploads/", { recursive: true });
  //   cb(null, "public/images/uploads/");
  // },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = (file) => {
  return upload.single(file);
};
