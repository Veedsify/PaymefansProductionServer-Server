class RequestController {

     static async createRequest(req, res) {

          const processRequest = await startmodelverificationService(req.body, req);

          if (processRequest.error) {
               return res.status(400).json({ message: processRequest.message })
          }

          return res.status(200).json({ message: processRequest.message });

     }


}