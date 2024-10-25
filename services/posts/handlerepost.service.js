const {v4: uuid} = require('uuid');
const prismaQuery = require('../../utils/prisma');
const handleRepostService = async ({post_id, user}) => {
    try {

        const postId = post_id;
        const userId = user.id;

        // Repost the post
        const getPost = await prismaQuery.post.findFirst({
            where: {
                post_id: postId
            }
        })

        if (!getPost) {
            return {
                error: true,
                message: "Post not found"
            }
        }

        // Check if the post is already reposted by the user
        const isRepost = await prismaQuery.userRepost.findFirst({
            where: {
                post_id: getPost.id,
                user_id: userId
            }
        })

        if (isRepost) {
            return {
                error: true,
                message: "You have already reposted this post"
            }
        }

        const repostId = uuid();

        const repost = await prismaQuery.userRepost.create({
            data: {
                post_id: getPost.id,
                user_id: userId,
                repost_id: repostId
            }
        })

        if (repost) {
            prismaQuery.$disconnect()
            return {
                error: false,
                message: "Post reposted successfully"
            }
        }

        return {
            error: true,
            message: "An error occurred while reposting the post"
        }

    } catch (e) {
        console.log(e)
        return {
            error: true,
            message: e.message
        }
    }
}

module.exports = {
    handleRepostService
}