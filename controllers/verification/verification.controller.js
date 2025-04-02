const { ProcessVerification } = require("../../services/verifications/verification.sevice")

class VerificationController {

     static async StartVerification(req, res) {
          const processUserFaceverification = await ProcessVerification(req)
          if (processUserFaceverification.error) {
              return res.status(401).json({
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
