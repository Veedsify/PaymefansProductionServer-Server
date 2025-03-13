const multer = require('multer');
const { v4: uuid } = require("uuid");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload
