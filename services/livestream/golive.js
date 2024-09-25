const prismaQuery = require("../../utils/prisma")

module.exports = async function goLive(stream_id, req) {
     const { action } = req.body
     const stream = await prismaQuery.liveStream.update({
          where: {
               stream_id: stream_id
          },
          data: {
               stream_status: action === 'go-live' ? 'active' : 'offline'
          }
     })

     if (!stream) {
          return {
               error: true,
               message: "Unable to go live"
          }
     }

     return {
          error: false,
          message: "Stream is now live"
     }
}