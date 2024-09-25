const prismaQuery = require("../../utils/prisma");

module.exports = async function getStream(stream_id, req) {
     try {
          const { user } = req;
          const stream = await prismaQuery.liveStream.findFirst({
               where: {
                    stream_id: stream_id,
                    stream_status: "active"
               },
               select: {
                    stream_id: true,
                    title: true,
                    stream_call_id: true,
                    id: true,
                    user_stream_id: true,
                    _count: {
                         select: {
                              LiveStreamLike: true,
                              LiveStreamComment: true
                         }
                    },
                    user: {
                         select: {
                              user_id: true,
                              username: true,
                              email: true,
                              profile_image: true,
                              profile_banner: true,
                         }
                    }
               }
          })

          if (!stream) {
               console.log(stream);
               return { error: true, message: "Stream not found" };
          }

          return { error: false, data: stream };
     }
     catch (error) {
          return { error: true, message: error.message };
     }
}