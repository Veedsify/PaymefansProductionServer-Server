const prismaQuery = require("../prisma");

class FeedService {
  constructor() {
    // Constants for feed algorithm parameters
    this.POSTS_PER_PAGE = process.env.POSTS_PER_HOME_PAGE;
    this.ENGAGEMENT_WEIGHT = 0.4;
    this.RECENCY_WEIGHT = 0.3;
    this.RELEVANCE_WEIGHT = 0.3;
    this.TIME_DECAY_FACTOR = 0.1;
  }

  calculateEngagementScore(post) {
    return (
      (post.post_likes * 1 + post.post_comments * 1.5 + post.post_reposts * 2) /
      (post.post_likes + post.post_comments + post.post_reposts || 1)
    );
  }

  calculateRecencyScore(postDate) {
    const ageInHours = (new Date() - new Date(postDate)) / (1000 * 60 * 60);
    return Math.exp(-this.TIME_DECAY_FACTOR * ageInHours);
  }

  async calculateRelevanceScore(post, userId) {
    const userInteractions = await prismaQuery.postLike.findMany({
      where: { user_id: userId },
      include: { post: true },
    });

    const followsCreator = await prismaQuery.follow.findFirst({
      where: {
        user_id: post.user_id,
        follower_id: userId,
      },
    });

    const isSubscribed = await prismaQuery.subscribers.findFirst({
      where: {
        user_id: post.user_id,
        subscriber_id: userId,
      },
    });

    let relevanceScore = 0;
    if (followsCreator) relevanceScore += 0.3;
    if (isSubscribed) relevanceScore += 0.5;

    const similarContentInteraction = userInteractions.filter(
      (interaction) => interaction.post.user_id === post.user_id,
    ).length;

    relevanceScore += Math.min(similarContentInteraction * 0.1, 0.2);
    return Math.min(relevanceScore, 1);
  }

  async getHomeFeed(userId, page) {
    const skip = (page - 1) * this.POSTS_PER_PAGE;

    const posts = await prismaQuery.post.findMany({
      where: {
        post_is_visible: true,
        post_status: "approved",
        OR: [
          { post_audience: "public" },
          {
            AND: [
              { post_audience: "followers" },
              { user: { Follow: { some: { follower_id: userId } } } },
            ],
          },
          {
            AND: [
              { post_audience: "subscribers" },
              { user: { Subscribers: { some: { subscriber_id: userId } } } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            fullname: true,
            user_id: true,
            username: true,
            profile_image: true,
            profile_banner: true,
            bio: true,
            Subscribers: {
              select: {
                subscriber_id: true,
                created_at: true,
              },
            },
            total_followers: true,
          },
        },
        UserMedia: true,
        PostLike: true,
        UserRepost: true,
      },
      skip,
      take: Number(this.POSTS_PER_PAGE),
      orderBy: { created_at: "desc" },
    });

    const scoredPosts = await Promise.all(
      posts.map(async (post) => {
        const engagementScore = this.calculateEngagementScore(post);
        const recencyScore = this.calculateRecencyScore(post.created_at);
        const relevanceScore = await this.calculateRelevanceScore(post, userId);

        const totalScore =
          engagementScore * this.ENGAGEMENT_WEIGHT +
          recencyScore * this.RECENCY_WEIGHT +
          relevanceScore * this.RELEVANCE_WEIGHT;

        return { ...post, score: totalScore };
      }),
    );

    return {
      posts: scoredPosts.sort((a, b) => b.score - a.score),
      page,
      hasMore: scoredPosts.length === this.POSTS_PER_PAGE,
    };
  }

  async getUserPosts(viewerId, targetUserId, page) {
    const skip = (page - 1) * this.POSTS_PER_PAGE;

    const isFollowing = await prismaQuery.follow.findFirst({
      where: {
        user_id: targetUserId,
        follower_id: viewerId,
      },
    });

    const isSubscribed = await prismaQuery.subscribers.findFirst({
      where: {
        user_id: targetUserId,
        subscriber_id: viewerId,
      },
    });

    const posts = await prismaQuery.post.findMany({
      where: {
        user_id: targetUserId,
        post_is_visible: true,
        OR: [
          { post_audience: "public" },
          {
            AND: [
              { post_audience: "followers" },
              { user_id: isFollowing ? targetUserId : -1 },
            ],
          },
          {
            AND: [
              { post_audience: "subscribers" },
              { user_id: isSubscribed ? targetUserId : -1 },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            fullname: true,
            user_id: true,
            username: true,
            profile_image: true,
            profile_banner: true,
            bio: true,
            total_followers: true,
          },
        },
        UserMedia: true,
        PostLike: true,
        UserRepost: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: Number(this.POSTS_PER_PAGE),
    });

    return {
      posts,
      page,
      hasMore: posts.length === this.POSTS_PER_PAGE,
    };
  }
}

module.exports = FeedService;
