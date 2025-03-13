const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const storage = multer.memoryStorage({
  filename: function (req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = (file) => {
  return upload.fields([{ name: file }]);
};
