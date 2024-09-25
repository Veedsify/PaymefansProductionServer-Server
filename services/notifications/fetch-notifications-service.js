const prismaQuery = require("../../utils/prisma")

module.exports = async ({ page, userId }) => {
     try {
          const notificationLoadLimit = 40
          const total = await prismaQuery.notifications.count()
          const notifications = await prismaQuery.notifications.findMany({
               where: {
                    user_id: userId
               },
               orderBy: {
                    created_at: "desc"
               },
               skip: ((parseInt(page) - 1) * notificationLoadLimit),
               take: notificationLoadLimit,
          })
          await prismaQuery.$disconnect()

          return {
               total,
               data: notifications
          }

     } catch (err) {
          console.log(err);
          throw new Error(err)
     }
}