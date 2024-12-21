const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../libs/s3");
const acceptedCountries = require("../../utils/acceptedCountries");
const documentTypes = require("../../utils/documentType");

const { AwsFaceVerification } = require("./aws_face_verification.service");
const prismaQuery = require("../../utils/prisma");
const { uploadFile } = require("./upload.service");

class VerificationService {
  static async ProcessVerification(req) {
    try {
      const { terms, country, documentType } = req.body;

      // Check if the user has accepted the terms
      if (!terms) {
        return {
          error: true,
          message: "You must accept the terms and conditions",
        };
      }

      // Check if the country is supported
      if (!acceptedCountries.includes(String(country).toLowerCase())) {
        return {
          error: true,
          message: "Country not supported",
        };
      }

      // Check if the document type is valid
      if (!documentTypes.includes(String(documentType).toLowerCase())) {
        return {
          error: true,
          message: "Invalid document type",
        };
      }

      const VerifyFaceWithAws = await AwsFaceVerification(
        req.files.front[0].buffer,
        req.files.back[0].buffer,
        req.files.faceVideo[0].buffer,
        req.params.token
      );

      if (VerifyFaceWithAws.error) {
        return {
          error: true,
          message: VerifyFaceWithAws.message,
        };
      }

      console.log('FIles', req.files)

      const token = req.params.token;
      const verificationImageUpload = await uploadFile(
        req.files.front[0].buffer,
        req.files.front[0].mimetype
      );
      
      const verificationVideoUpload = await uploadFile(
        req.files.faceVideo[0].buffer,
        req.files.faceVideo[0].mimetype
      );

      const data = {
        verification_image: verificationImageUpload.url,
        verification_state: "approved",
        verification_status: true,
        verification_video: verificationVideoUpload.url,
      };

      const updateUserAsVerified = await prismaQuery.model.update({
        where: {
          token: token,
        },
        data:data
      });

      if (updateUserAsVerified) {
        return {
          error: false,
          message: "Verification Completed Successfully started",
        };
      }
    } catch (err) {
      console.log(err);
      return {
        error: true,
        message: err.message,
      };
    }
  }
}

module.exports = VerificationService;
