const createLivestream = require("../../services/livestream/create-livestream");
const getHostStream = require("../../services/livestream/get-host-stream");
const getStream = require("../../services/livestream/get-stream");
const golive = require("../../services/livestream/golive");

class LiveStreamController {
     static async CreateLiveStream(req, res) {
          const { title } = req.body;
          const handleCreateLiveStream = await createLivestream(title, req)

          if (handleCreateLiveStream.error) {
               return res.status(400).json({ status: 'error', message: handleCreateLiveStream.message });
          }

          res.status(200).json({ status: 'success', message: "Live stream created successfully", data: handleCreateLiveStream.data });
     }
     static async GetStream(req, res) {
          const { stream_id } = req.params;
          const handleGetStream = await getStream(stream_id, req)

          if (handleGetStream.error) {
               console.log(handleGetStream.message);
               return res.status(400).json({ status: 'error', message: handleGetStream.message });
          }
          res.status(200).json({ status: 'success', message: "Live stream fetched successfully", data: handleGetStream.data });
     }
     static async GetHostStreamSettings(req, res) {
          const { stream_id } = req.params;
          const handleGetStream = await getHostStream(stream_id, req)

          if (handleGetStream.error) {
               console.log(handleGetStream.message);
               return res.status(400).json({ status: 'error', message: handleGetStream.message });
          }
          res.status(200).json({ status: 'success', message: "Live stream fetched successfully", data: handleGetStream.data });
     }
     static async GoLive(req, res) {
          const { stream_id } = req.params;
          const handleGoLive = await golive(stream_id, req)
          if (handleGoLive.error) {
               console.log(handleGoLive.message);
               return res.status(400).json({ status: 'error', message: handleGoLive.message });
          }

          res.status(200).json({ status: 'success', message: "Live stream is now live", data: handleGoLive.data });
     }
}

module.exports = LiveStreamController;