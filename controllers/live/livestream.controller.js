const axios = require('axios')
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

    const MEETING_ID = 'bbb41076-4cf0-4186-bd5e-8c9fc4696cfc'
    const url = process.env.DYTE_BASE_URL + `/meetings/${MEETING_ID}/participants`
    try {
      const response = await axios.post(url, {
        "name": "Mary Sue",
        "picture": "https://i.imgur.com/test.jpg",
        "preset_name": "group_call_host",
        "custom_participant_id": Math.random().toString(36).substring(7)
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(process.env.DYTE_ORGANIZATION_ID + ':' + process.env.DYTE_API_KEY)}`,
        }
      })
      console.log(response.data)
      res.render("live/index", {
        stream: stream.data,
        stream_server: process.env.SERVER_ORIGINAL_URL,
        authToken: response.data.data.token,
      });
    }
    catch (error) {
      console.log(error)
    }
  }

  //   LiveStreamViewsCounter
  static async liveStreamView(req, res) {

  }
}

module.exports = {
  LiveStreamController,
};
