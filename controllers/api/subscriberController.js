const prismaQuery = require("../../utils/prisma");
const { v4: uuidv4 } = require("uuid");

class subscriberController {
  static async checkSubscriber(req, res) {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ status: false, message: "Invalid request" });
      }

      const { main_user_id, user_id } = data;

      if (main_user_id === user_id) {
        return res.status(200).json({ status: true, isSubscriber: true });
      }

      const subscriberData = await prismaQuery.user.findFirst({
        where: {
          id: main_user_id,
          Subscribers: {
            some: {
              subscriber_id: user_id
            }
          }
        }
      });

      if (!subscriberData) {
        return res.status(200).json({ status: true, isSubscriber: false });
      }

      res.status(200).json({ status: true, isSubscriber: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "An error occured" });
    }

  }

  static async unfollow(req, res) {
    const { userId, followerId } = req.body;
    const result = await this.followerService.unfollow(userId, followerId);
    res.json(result);
  }

  static async CheckFollower(req, res) {
    const { userId, followerId } = req.body;
    res.json({ status: true, message: "Follower found" });
  }

  static async GetSubscriptionData(req, res) {
    try {
      const user_id = req.params.userid;

      const subscriberData = await prismaQuery.user.findFirst({
        where: {
          user_id: user_id
        },
        select: {
          id: true,
          username: true,
          name: true,
          user_id: true,
          profile_image: true,
          Model: {
            select: {
              gender: true,
            }
          },
          Settings: {
            select: {
              subscription_price: true,
              subscription_duration: true
            }
          }
        }
      });

      if (!subscriberData) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      res.status(200).json({
        status: true,
        data: subscriberData
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "An error occured" });
    }
  }

  static async CreateNewSubscription(req, res) {
    try {
      const profileid = req.params.profileid;
      const user = prismaQuery.user.findFirst({
        where: {
          id: req.user.id
        },
        select: {
          id: true,
          user_id: true,
          UserPoints: {
            select: {
              points: true
            }
          }
        }
      })

      const profile = prismaQuery.user.findFirst({
        where: {
          user_id: profileid
        },
        select: {
          id: true,
          user_id: true,
          Settings: {
            select: {
              subscription_price: true,
              subscription_duration: true
            }
          }
        }
      })
      const [userdata, profileData] = await Promise.all([user, profile]);

      if (!profileData) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      if (!userdata) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      const checkSubscription = await prismaQuery.subscribers.findFirst({
        where: {
          user_id: profileData.id,
          subscriber_id: userdata.id
        }
      });

      if (checkSubscription) {
        return res.status(200).json({ status: false, message: "You are already subscribed to this user" });
      }

      if (profileData.Settings.subscription_price > userdata.UserPoints.points) {
        return res.status(200).json({ status: false, message: "You don't have enough points to subscribe to this user" });
      }

      const createSubscription = await prismaQuery.subscribers.create({
        data: {
          user_id: profileData.id,
          subscriber_id: userdata.id,
          sub_id: uuidv4()
        }
      })

      if (!createSubscription) {
        return res.status(500).json({ status: false, message: "An error occured" });
      }

      const updatePoints = await prismaQuery.user.update({
        where: {
          id: userdata.id
        },
        data: {
          UserPoints: {
            update: {
              points: {
                increment: -profileData.Settings.subscription_price
              }
            }
          }
        }
      })

      const updatePointsForModel = await prismaQuery.user.update({
        where: {
          id: profileData.id
        },
        data: {
          UserPoints: {
            update: {
              points: {
                increment: profileData.Settings.subscription_price
              }
            }
          }
        }
      })

      if (!updatePoints || !updatePointsForModel) {
        return res.status(500).json({ status: false, message: "An error occured" });
      }

      prismaQuery.$disconnect();

      res.status(200).json({
        status: true,
        message: "Subscription successful"
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "An error occured" });
    }
  }
}

module.exports = subscriberController;
