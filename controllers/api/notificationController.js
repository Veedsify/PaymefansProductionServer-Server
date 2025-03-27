const fetchNotificationsService = require("../../services/notifications/fetch-notifications-service");
const prismaQuery = require("../../utils/prisma");
const { notifications } = require("../../utils/prisma");

class NotificationController {
     static async getMyNotifications(req, res) {
          try {
               const fetchNotifications = await fetchNotificationsService({
                    page: req.params.page,
                    userId: req.user.id
               })

               if (fetchNotifications.error) {
                    console.log(notifications.error);
                    res.status(500).json({
                         status: false,
                         message: `An error occured while fetching notifications`
                    })
               }

               res.status(200).json({
                    status: true,
                    message: `notifications retrieved`,
                    data: fetchNotifications.data,
                    total: fetchNotifications.total
               })
          } catch (error) {
               console.log(notifications.error);
               res.status(500).json({
                    status: false,
                    message: `An error occured while fetching notifications`
               })
          }
     }
     static async markNotificationAsRead(req, res) {
          try {
               const id = req.params.id
               await prismaQuery.notifications.update({
                    where: {
                         id: parseInt(id),
                    },
                    data: {
                         read: true
                    }
               })
               await prismaQuery.$disconnect()
               res.status(200).json({
                    status: true,
                    message: `Update Successful`
               })
          } catch (error) {
               console.log(error);
               res.status(500).json({
                    status: false,
                    message: `An error occured while marking this message as read`
               })
          }
     }
}


module.exports = NotificationController
