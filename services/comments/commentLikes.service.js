const prismaQuery = require("../../utils/prisma")

const CommentLikesService = () => {
     const create = async (commentId, userId) => {
          try {
               const commentLike = await prismaQuery.postCommentLikes.findFirst({
                    where: {
                         comment_id: Number(commentId),
                         user_id: Number(userId)
                    }
               })

               if (commentLike) {
                    await remove(commentId, userId)
                    return {
                         error: false,
                         message: 'Comment like removed successfully'
                    }
               } else {
                    await prismaQuery.postCommentLikes.create({
                         data: {
                              comment_id: Number(commentId),
                              user_id: Number(userId)
                         }
                    })

                    return {
                         error: false,
                         message: 'Comment liked successfully'
                    }
               }
          } catch (error) {
               console.error(error)
               return {
                    error: true,
                    message: 'An error occured while liking comment'
               }
          }
     }

     const remove = async (commentId, userId) => {
          await prismaQuery.postCommentLikes.deleteMany({
               where: {
                    comment_id: Number(commentId),
                    user_id: Number(userId)
               }
          })

          return {
               error: false,
               message: 'Comment like removed successfully'
          }
     }

     return {
          create,
          remove
     }
}

module.exports = CommentLikesService;
