const { v4: uuid } = require('uuid');
const prismaQuery = require('../../utils/prisma');
const handleRepostService = async ({ post_id, user }) => {
    try {
        const postId = post_id;
        const userId = user.id;
        const audienceTypes = ['private', 'subscribers', 'followers']
        // Repost the post
        const getPost = await prismaQuery.post.findFirst({
            where: {
                post_id: postId,
                post_status: "approved"
            },
            select: {
                post_audience: true,
                user: {
                    select: {
                        id: true
                    }
                },
                id: true,
            }
        })
        if (!getPost) {
            return {
                error: true,
                message: "Post not found"
            }
        }
        const postAudience = getPost.post_audience
        if (audienceTypes.includes(postAudience)) {
            const isSubscriber = prismaQuery.post.findFirst({
                where: {
                    post_id: postId,
                    user: {
                        Subscribers: {
                            some: {
                                subscriber_id: userId,
                            }
                        }
                    }
                },
            })
            if (isSubscriber && getPost.user.id !== userId) {
                return {
                    error: true,
                    message: "You are not a subscriber of this post, therefore you cannot repost it"
                }
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
