const { PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = require("../../libs/s3")
const acceptedCountries = require("../../utils/acceptedCountries")
const documentTypes = require("../../utils/documentType")
const { v4: uuidv4 } = require('uuid')

class VerificationService {

     static async ProcessVerification(verificationData, files) {
          try {
               const {
                    terms,
                    country,
                    documentType,
               } = verificationData

               const { front, back, faceVideo } = files

               // Check if the user has accepted the terms
               if (!terms) {
                    return {
                         error: true,
                         message: 'You must accept the terms and conditions'
                    }
               }

               // Check if the country is supported
               if (!acceptedCountries.includes(country.tolowercase())) {
                    return {
                         error: true,
                         message: 'Country not supported'
                    }
               }

               // Check if the document type is valid
               if (!documentTypes.includes(documentType.tolowercase())) {
                    return {
                         error: true,
                         message: 'Invalid document type'
                    }
               }

               const verifcationFiles = files.map(file => {
                    return async (file) => {
                         const fileId = `verification/${uuidv4()}`
                         const params = {
                              Bucket: process.env.S3_BUCKET_NAME,
                              Key: fileId,
                              Body: file,
                              ContentType: element.mimetype,
                         }
                         const command = new PutObjectCommand(params)
                         s3.send(command)
                         return fileId
                    }
               })

               const [frontImage, backImage, faceVerificationVideo] = await Promise.all(verifcationFiles)

               console.log(frontImage, backImage, faceVerificationVideo)

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