const axios = require('axios');
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

          if (!stream) {
               return { error: true, message: "Stream not found" };
          }

          const MEETING_ID = 'bbb41076-4cf0-4186-bd5e-8c9fc4696cfc'
          const url = process.env.DYTE_BASE_URL + `/meetings/${MEETING_ID}/participants`
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

          return { error: false, data: { ...stream, authToken: response.data.data.token} };
     }
     catch (error) {
          return { error: true, message: error.message };
     }
}
