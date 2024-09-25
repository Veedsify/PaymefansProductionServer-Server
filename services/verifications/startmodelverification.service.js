const prismaQuery = require("../../utils/prisma")
module.exports = async (data, req) => {
     const { id } = req.user
     try {
          const checkIfStarted = await prismaQuery.model.findFirst({
               where: {
                    user_id: id,
                    verification_state: "started"
               }
          })

          if (checkIfStarted) {
               return { error: false, message: "Verification already started" }
          }

          await prismaQuery.model.update({
               where: {
                    user_id: id
               },
               data: {
                    verification_state: "started"
               }
          })
          return { error: false, message: "Verification started" }
     } catch (error) {
          return { error: true, message: error.message }
     }
}