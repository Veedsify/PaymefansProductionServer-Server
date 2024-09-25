const prismaQuery = require("../../utils/prisma");

class PostInteractions {
    static async likePost(req, res) {
        try {
            const userid = req.user.id;
            const { post_id } = req.params;
            let postHasBeenLiked = false;

            // Verify if post has been liked by user
            const postLike = await prismaQuery.postLike.findFirst({
                where: {
                    post_id: parseInt(post_id),
                    user_id: userid
                }
            })

            if (!postLike) {
                await prismaQuery.postLike.create({
                    data: {
                        post_id: parseInt(post_id),
                        like_id: 1,
                        user_id: userid
                    }
                })
                await prismaQuery.post.update({
                    where: {
                        id: parseInt(post_id)
                    },
                    data: {
                        post_likes: {
                            increment: 1
                        }
                    }
                })
                postHasBeenLiked = true;
            } else {
                await prismaQuery.postLike.delete({
                    where: {
                        id: postLike.id
                    }
                })
                await prismaQuery.post.update({
                    where: {
                        id: parseInt(post_id)
                    },
                    data: {
                        post_likes: {
                            decrement: 1
                        }
                    }
                })
            }

            return res.status(200).json({
                success: true,
                isLiked: postHasBeenLiked,
                message: postHasBeenLiked ? "Post has been liked" : "Post has been unliked"
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

module.exports = PostInteractions;