const { S3Client } = require('@aws-sdk/client-s3')
require('dotenv').config()
const { S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env

const s3 = new S3Client({
     region: S3_REGION,
     credentials: {
          accessKeyId: S3_ACCESS_KEY,
          secretAccessKey: S3_SECRET_KEY
     }
})

module.exports = s3