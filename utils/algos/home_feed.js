const express = require('express');
const router = express.Router();
const prismaQuery = require('../prisma')

// Constants for feed algorithm parameters
const POSTS_PER_PAGE = 20;
const ENGAGEMENT_WEIGHT = 0.4;
const RECENCY_WEIGHT = 0.3;
const RELEVANCE_WEIGHT = 0.3;
const TIME_DECAY_FACTOR = 0.1;

/**
 * Calculate engagement score based on likes, comments, and shares
 */
const calculateEngagementScore = (post) => {
  return (
    (post.post_likes * 1 + 
     post.post_comments * 1.5 + 
     post.post_reposts * 2) / 
    (post.post_likes + post.post_comments + post.post_reposts || 1)
  );
};

/**
 * Calculate time decay score based on post age
 */
const calculateRecencyScore = (postDate) => {
  const ageInHours = (new Date() - new Date(postDate)) / (1000 * 60 * 60);
  return Math.exp(-TIME_DECAY_FACTOR * ageInHours);
};

/**
 * Calculate relevance score based on user interests and behavior
 */
const calculateRelevanceScore = async (post, userId) => {
  // Get user's interaction history
  const userInteractions = await prismaQuery.postLike.findMany({
    where: { user_id: userId },
    include: { post: true }
  });

  // Check if user follows the post creator
  const followsCreator = await prismaQuery.follow.findFirst({
    where: {
      user_id: post.user_id,
      follower_id: userId
    }
  });

  // Check if user is subscribed to the post creator
  const isSubscribed = await prismaQuery.subscribers.findFirst({
    where: {
      user_id: post.user_id,
      subscriber_id: userId
    }
  });

  let relevanceScore = 0;
  
  // Increase score if user follows or is subscribed to creator
  if (followsCreator) relevanceScore += 0.3;
  if (isSubscribed) relevanceScore += 0.5;

  // Add score based on similar content interaction
  const similarContentInteraction = userInteractions.filter(interaction => 
    interaction.post.user_id === post.user_id
  ).length;

  relevanceScore += Math.min(similarContentInteraction * 0.1, 0.2);

  return Math.min(relevanceScore, 1);
};

/**
 * Main feed fetching route
 */
router.get('/feed', async (req, res) => {
  try {
    const userId = parseInt(req.user.id); // Assuming user is authenticated
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;

    // Fetch base posts query
    const posts = await prismaQuery.post.findMany({
      where: {
        post_is_visible: true,
        OR: [
          { post_audience: 'public' },
          {
            AND: [
              { post_audience: 'followers' },
              {
                user: {
                  Follow: {
                    some: {
                      follower_id: userId
                    }
                  }
                }
              }
            ]
          },
          {
            AND: [
              { post_audience: 'subscribers' },
              {
                user: {
                  Subscribers: {
                    some: {
                      subscriber_id: userId
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        user: true,
        UserMedia: true,
        PostLike: true,
        PostComment: true,
        UserRepost: true
      },
      skip,
      take: POSTS_PER_PAGE,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Calculate scores and rank posts
    const scoredPosts = await Promise.all(posts.map(async (post) => {
      const engagementScore = calculateEngagementScore(post);
      const recencyScore = calculateRecencyScore(post.created_at);
      const relevanceScore = await calculateRelevanceScore(post, userId);

      const totalScore = 
        (engagementScore * ENGAGEMENT_WEIGHT) +
        (recencyScore * RECENCY_WEIGHT) +
        (relevanceScore * RELEVANCE_WEIGHT);

      return {
        ...post,
        score: totalScore
      };
    }));

    // Sort posts by score
    const rankedPosts = scoredPosts.sort((a, b) => b.score - a.score);

    // Return response
    res.json({
      posts: rankedPosts,
      page,
      hasMore: rankedPosts.length === POSTS_PER_PAGE
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Error fetching feed' });
  }
});

/**
 * Route to fetch posts from specific user
 */
router.get('/user/:userId/posts', async (req, res) => {
  try {
    const viewerId = parseInt(req.user.id); // Authenticated user viewing the posts
    const targetUserId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * POSTS_PER_PAGE;

    // Check relationships
    const isFollowing = await prismaQuery.follow.findFirst({
      where: {
        user_id: targetUserId,
        follower_id: viewerId
      }
    });

    const isSubscribed = await prismaQuery.subscribers.findFirst({
      where: {
        user_id: targetUserId,
        subscriber_id: viewerId
      }
    });

    // Fetch posts based on viewer's access level
    const posts = await prismaQuery.post.findMany({
      where: {
        user_id: targetUserId,
        post_is_visible: true,
        OR: [
          { post_audience: 'public' },
          {
            AND: [
              { post_audience: 'followers' },
              { user_id: isFollowing ? targetUserId : -1 }
            ]
          },
          {
            AND: [
              { post_audience: 'subscribers' },
              { user_id: isSubscribed ? targetUserId : -1 }
            ]
          }
        ]
      },
      include: {
        user: true,
        UserMedia: true,
        PostLike: true,
        PostComment: true,
        UserRepost: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: POSTS_PER_PAGE
    });

    res.json({
      posts,
      page,
      hasMore: posts.length === POSTS_PER_PAGE
    });

  } catch (error) {
    console.error('User posts error:', error);
    res.status(500).json({ error: 'Error fetching user posts' });
  }
});

module.exports = router;
