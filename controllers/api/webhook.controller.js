const { handleCloudflareProcessedMedia } = require("../../utils/webhooks/handle-processed-post-media");

class WebhookController {
      static async ProcessedMedia(req, res) {
            const handleMedia = await handleCloudflareProcessedMedia(req.body)
      }
}

module.exports = WebhookController
