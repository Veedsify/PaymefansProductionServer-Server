const prismaQuery = require("../../utils/prisma");
const { v4: uuidv4 } = require("uuid");
module.exports = async (data, req) => {
     const { id } = req.user;
     try {
          const checkIfStarted = await prismaQuery.model.findFirst({
               where: {
                    user_id: id,
                    verification_state: "started",
               },
          });

          if (checkIfStarted) {
               return { error: false, message: "Verification already started", token: checkIfStarted.token };
          }

          await prismaQuery.model.update({
               where: {
                    user_id: id,
               },
               data: {
                    verification_state: "started",
               },
          });

          const vtoken = prismaQuery.model.findFirst({
               where: {
                    user_id: id
               }
          })

          return {
               error: false,
               message: "Verification started",
               token: vtoken.token
          };
     } catch (error) {
          return { error: true, message: error.message };
     }
};
