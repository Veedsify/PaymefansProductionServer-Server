const { ProcessVerification } = require("../../services/verifications/verification.sevice")

class VerificationController {

     static async StartVerification(req, res) {
          const processUserFaceverification = await ProcessVerification(req.body, req.files)
          if (processUserFaceverification.error) {
               res.status(400).json({
                    status: false,
                    message: processUserFaceverification.message
               })
          }

          res.status(200).json({
               status: true,
               message: processUserFaceverification.message
          })
     }

}

module.exports = VerificationController