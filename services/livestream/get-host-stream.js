const prismaQuery = require("../../utils/prisma");

module.exports = async function getHostStream(stream_id, req) {
     try {
          const { user } = req;
          let stream;

          stream = await prismaQuery.liveStream.findFirst({
               where: {
                    stream_id: stream_id,
               },
               select: {
                    stream_id: true,
                    title: true,
                    stream_token: true,
                    user_id: true,
                    stream_status: true,
                    participants: true,
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
                              name: true,
                              profile_image: true,
                              profile_banner: true,
                         }
                    }
               }
          })

          if (!stream) {
               const invitee = await prismaQuery.liveStream.findFirst({
                    where: {
                         stream_id: stream_id,
                         participants: {
                              some: {
                                   participant_id: user.user_id
                              }
                         },
                    },
                    select: {
                         stream_id: true,
                         title: true,
                         stream_token: true,
                         stream_status: true,
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
                                   name: true,
                                   profile_image: true,
                                   profile_banner: true,
                              }
                         }
                    }
               })

               stream = { user_id: user.user_id, ...invitee }
          }

          if(!stream) {
               return { error: true, message: "Stream not found" };
          }

          return { error: false, data: stream };
     }
     catch (error) {
          return { error: true, message: error.message };
     }
}