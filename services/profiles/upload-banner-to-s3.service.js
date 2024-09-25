const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../libs/s3");

module.exports = async (buffer, req, filepath) => {
     try {
          const params = {
               Bucket: process.env.S3_BUCKET_NAME,
               Key: filepath,
               Body: buffer,
               ContentType: req.file.mimetype,
          }
          const command = new PutObjectCommand(params)
          await s3.send(command);
          return true;
     } catch (error) {
          console.log(error);
          return false;
     }
}