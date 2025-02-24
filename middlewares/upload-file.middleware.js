const multer = require('multer')
const {randomUUID} = require("node:crypto");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename(req, file, callback) {
        const fileName = randomUUID()
        cb(null, fileName)
    },
})

const upload = multer({
    storage,
    limits: {fileSize: 7 * 1024 * 1024 * 1024}
})

module.exports = upload