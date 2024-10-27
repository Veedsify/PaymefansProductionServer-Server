const { PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = require("../../libs/s3")
const acceptedCountries = require("../../utils/acceptedCountries")
const documentTypes = require("../../utils/documentType")
const { v4: uuidv4 } = require('uuid')
const getSingleFrameFromVideo = require("../../utils/verification/getSingleFrameFromVideo")

class VerificationService {

     static async ProcessVerification(verificationData, files) {
          try {
               const {
                    terms,
                    country,
                    documentType,
               } = verificationData

               // Check if the user has accepted the terms
               if (!terms) {
                    return {
                         error: true,
                         message: 'You must accept the terms and conditions'
                    }
               }

               // Check if the country is supported
               if (!acceptedCountries.includes(String(country).toLowerCase())) {
                    return {
                         error: true,
                         message: 'Country not supported'
                    }
               }

               // Check if the document type is valid
               if (!documentTypes.includes(String(documentType).toLowerCase())) {
                    return {
                         error: true,
                         message: 'Invalid document type'
                    }
               }
               const verificationFiles = [];
               const uploadFile = async (fileBuffer, fileType) => {
                    const fileId = `verification/${uuidv4()}`;
                    const params = {
                         Bucket: process.env.S3_BUCKET_NAME,
                         Key: fileId,
                         Body: fileBuffer,
                         ContentType: fileType,
                    };
                    const command = new PutObjectCommand(params);
                    await s3.send(command);
                    return fileId;
               };

               const frontUpload = async () => uploadFile(files.front[0].buffer, files.front[0].mimetype);
               const backUpload = async () => uploadFile(files.back[0].buffer, files.back[0].mimetype);
               const faceVerificationUpload = async () => uploadFile(files.faceVideo[0].buffer, files.faceVideo[0].mimetype);

               verificationFiles.push(frontUpload(), backUpload(), faceVerificationUpload());
               const [frontImage, backImage, faceVerificationVideo] = await Promise.all(verificationFiles);

               const videoframe = await getSingleFrameFromVideo (files.faceVideo[0].buffer);
               
               return {
                    error: false,
                    message: 'Verification process started'
               }
          } catch (err) {
               console.log(err)
               return {
                    error: true,
                    message: err.message
               }
          }

     }
}

module.exports = VerificationService