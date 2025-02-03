const FeedService = require('../../utils/algos/home_feed2');

const feedService = new FeedService()

class HomeFeedController {
     static async GetHomePosts(req, res) {
          try {
               const userId = parseInt(req.user.id);
               const page = parseInt(req.query.page) || 1;
               const result = await feedService.getHomeFeed(userId, page);
               res.json(result);
          } catch (error) {
               console.error('Feed error:', error);
               res.status(500).json({ error: 'Error fetching feed' });
          }
     }

     async GetUserPersonalPosts(req, res) {
          try {
               const viewerId = parseInt(req.user.id);
               const targetUserId = parseInt(req.params.userId);
               const page = parseInt(req.query.page) || 1;
               const result = await feedService.getUserPosts(viewerId, targetUserId, page);
               res.json(result);
          } catch (error) {
               console.error('User posts error:', error);
               res.status(500).json({ error: 'Error fetching user posts' });
          }
     }
}

module.exports = HomeFeedController;
