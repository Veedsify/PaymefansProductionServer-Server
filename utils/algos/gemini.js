const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/api/feed', async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // 1. Fetch users the current user is following
    const followedUsers = await prisma.follow.findMany({
      where: {
        follower_id: parseInt(userId),
      },
      select: {
        user_id: true,
      },
    });

    const followedUserIds = followedUsers.map((follow) => follow.user_id);

    // 2. Fetch users who are subscribed by current user
    const subscribedUsers = await prisma.subscribers.findMany({
      where: {
        subscriber_id: parseInt(userId)
      },
      select: {
        user_id: true
      }
    })
    const subscribedUserIds = subscribedUsers.map((sub) => sub.user_id);


    // 3. Fetch recent interactions (likes, comments, follows) of the user to infer interests
    const recentLikes = await prisma.postLike.findMany({
      where: {
        user_id: parseInt(userId),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 20, // Consider the last 20 likes as recent
      select: {
        post: {
          select: {
            user_id: true,
            User: {
              select: {
                username: true
              }
            }
          },
        },
      },
    });

    const recentComments = await prisma.postComment.findMany({
      where: {
        user_id: parseInt(userId),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10, // Consider the last 10 comments as recent
      select: {
        post: {
          select: {
            user_id: true,
            User: {
              select: {
                username: true
              }
            }
          },
        },
      },
    });

    // 4. Analyze recent interactions to determine preferred users
    const interactedUserIds = [
      ...recentLikes.map((like) => like.post.user_id),
      ...recentComments.map((comment) => comment.post.user_id),
    ];

    const interactedUsernames = [
      ...recentLikes.map((like) => like.post.User.username),
      ...recentComments.map((comment) => comment.post.User.username),
    ]

    const userCounts = {};
    interactedUserIds.forEach((id) => {
      userCounts[id] = (userCounts[id] || 0) + 1;
    });

    // Sort users by interaction count (descending)
    const sortedInteractedUserIds = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => parseInt(id));

    const sortedInteractedUsernames = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => {
        const username = interactedUsernames[interactedUserIds.indexOf(parseInt(id))];
        return username
      });
    // 5. Prioritize posts based on followed users, interacted users and subscribed users.
    const prioritizedPosts = await prisma.post.findMany({
      where: {
        OR: [
          {
            user_id: {
              in: followedUserIds,
            },
          },
          {
            user_id: {
              in: sortedInteractedUserIds,
            },
          },
          {
            user_id: {
              in: subscribedUserIds
            }
          },
          {
            user: {
              username: {
                in: sortedInteractedUsernames
              }
            }
          }
        ],
        post_is_visible: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_image: true,
          },
        },
        UserMedia: {
          select: {
            url: true,
            media_type: true
          }
        },
        _count: {
          select: {
            PostLike: true,
            PostComment: true,
          },
        },
      },
      orderBy: [
        {
          user_id: {
            in: subscribedUserIds,
          },
        },
        {
          user_id: {
            in: followedUserIds,
          },
        },
        {
          user_id: {
            in: sortedInteractedUserIds,
          },
        },
        {
          user: {
            username: {
              in: sortedInteractedUsernames
            }
          }
        },
        {
          created_at: 'desc',
        },
      ],
      skip: skip,
      take: limit,
    });

    res.json(prioritizedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
