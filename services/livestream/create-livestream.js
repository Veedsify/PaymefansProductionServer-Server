const { createStreamToken } = require("../../utils/getstream");
const { v4: uuidv4 } = require("uuid");
const prismaQuery = require("../../utils/prisma");

module.exports = async (data, req) => {
     try {
          let title = data;

          if (!title) {
               title = "New Stream From " + req.user.username;
          }

          const streamToken = await createStreamToken(req.user.user_id);
          const newCallId = `call-` + uuidv4();
          const stream_id = `${uuidv4()}-${req.user.user_id}`;

          const newStreamData = await prismaQuery.liveStream.create({
               data: {
                    user_id: req.user.user_id,
                    username: req.user.username,
                    stream_id: stream_id,
                    title: title,
                    user_stream_id: req.user.user_id,
                    stream_token: streamToken,
                    stream_call_id: newCallId,
               }
          })

          return { data: { ...newStreamData, callId: newCallId, name: req.user.name }, error: false };

     } catch (error) {
          return { error: true, message: error.message };
     }
}