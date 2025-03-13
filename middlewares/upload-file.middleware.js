const multer = require('multer')
const { randomUUID } = require("node:crypto");
const path = require("path")
const fs = require("fs")


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            })
        }
        cb(null, 'public/uploads')
    },
    filename(req, file, cb) {
        const fileName = randomUUID() + path.extname(file.originalname)
        cb(null, fileName)
    },
})

const uploadFileMiddleware = multer({
    storage,
    limits: { fileSize: 7 * 1024 * 1024 * 1024 }
})

module.exports = uploadFileMiddleware
