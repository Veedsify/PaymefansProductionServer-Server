const prismaQuery = require("../../utils/prisma");

const GetPostCommentService = () => {
  const allComments = async (postId) => {
    const comments = await prismaQuery.postComment.findMany({
      where: {
        post_id: Number(postId),
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        comment: true,
        created_at: true,
        user: {
          select: {
            id: true,
            user_id: true,
            name: true,
            username: true,
            profile_image: true,
          },
        },
        PostCommentAttachments: {
          select: {
            id: true,
            comment_id: true,
            path: true,
            type: true,
            created_at: true,
          },
        },
        PostCommentLikes: {
          select: {
            id: true,
            comment_id: true,
            user_id: true,
            created_at: true,
          },
        },
      },
    });

    if (!comments || comments.length == 0) {
      return {
        error: false,
        message: "No comments found",
        data: [],
      };
    }

    return {
      error: false,
      message: "Comments found",
      data: comments,
    };
  };

  return {
    allComments,
  };
};

module.exports = GetPostCommentService;
