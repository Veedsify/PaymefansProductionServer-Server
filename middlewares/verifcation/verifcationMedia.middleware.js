const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path')


const storage = multer.memoryStorage({
     filename: function (file, cb) {
          const fileID = uuidv4()
          const ext = path.extname(file.originalname)
          const uploadFile = fileID + ext
          cb(null, uploadFile)
     },
})

const HandleMediaUpload = multer({ storage })

module.exports = HandleMediaUpload
