const getHostStream = require("../../services/livestream/get-host-stream");

class LiveStreamController {
  static async getStream(req, res) {
    const stream_id = req.params.stream_id;
    if (!stream_id) {
      return res.redirect("/404");
    }

    const stream = await getHostStream(stream_id, req);

    if (stream.error) {
      console.log(stream.message);
      res.status(500).render("live/500");
      return;
    }

    console.log(stream.data);

    res.render("live/index", {
      stream: stream.data,
      stream_server: process.env.SERVER_ORIGINAL_URL,
    });
  }

  //   LiveStreamViewsCounter
  static async liveStreamView(req, res) {
     
  }
}

module.exports = {
  LiveStreamController,
};
