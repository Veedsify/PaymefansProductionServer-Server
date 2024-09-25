const STARTMODELVERIFICATIONSERVICE = require("../../services/verifications/startmodelverification.service");

class VerificationController {

     static async ModelVerification(req, res) {
          const { action } = req.body;
          try {
               switch (action) {
                    case "start":
                         const startVerification = await STARTMODELVERIFICATIONSERVICE(req.body, req);
                         if (startVerification.error) {
                              return res.status(500).json({ error: true, message: startVerification.message });
                         }
                         return res.status(200).json({ error: false, message: startVerification.message });
                    default:
                         return res.status(400).json({ error: true, message: "Invalid action" });
               }
          } catch (error) {
               res.status(500).json({ error: true, message: error.message });
          }

     }

}

module.exports = VerificationController;