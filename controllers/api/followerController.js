const prismaQuery = require("../../utils/prisma");

class followerController {
  static async follow(req, res) {
    const { userId, followerId } = req.body;
    const result = await this.followerService.follow(userId, followerId);
    res.json(result);
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

  static async GetFollowers(req, res) {
    try {
      const user_id = req.user.id;
      const min = parseInt(req.query.min);
      const max = parseInt(req.query.max);
      const followers = []

      const myFollowers = await prismaQuery.follow.findMany({
        where: {
          user_id: user_id
        },
        orderBy: {
          created_at: "desc"
        },
        skip: min === 0 ? 0 : min - 1,
        take: max
      });

      for (let i = 0; i < myFollowers.length; i++) {
        const user = await prismaQuery.user.findUnique({
          where: {
            id: myFollowers[i].follower_id
          },
          select: {
            id: true,
            username: true,
            name: true,
            fullname: true,
            profile_image: true,
          }
        });
        const meFollowing = await prismaQuery.follow.findFirst({
          where: {
            user_id: user.id,
            follower_id: user_id
          }
        });

        followers.push({
          user,
          iAmFollowing: meFollowing ? true : false
        });
      }

      res.status(200).json({ status: true, followers: followers, minmax: req.query.min + " - " + req.query.max });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "An error occured" });
    }
  }
}

module.exports = followerController;
