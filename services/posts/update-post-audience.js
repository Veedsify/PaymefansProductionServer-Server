const prismaQuery = require("../../utils/prisma")

const UpdatePostAudience = async (user_id, post_id, visibility) => {
     try {
          const findPost = await prismaQuery.post.findFirst({
               where: {
                    post_id: post_id,
                    user_id: user_id
               }
          })

          if (!findPost) {
               return { error: true, message: "Post not found" }
          }

          const updatePost = await prismaQuery.post.update({
               where: {
                    id: findPost.id
               },
               data: {
                    post_audience: String(visibility).trim().toLowerCase(),
               }
          })
          const updateMedia = await prismaQuery.userMedia.updateMany({
               where: {
                    post_id: findPost.id
               },
               data: {
                    accessible_to: String(visibility).trim().toLowerCase()
               }
          })

          if (!updatePost || !updateMedia) {
               return { error: true, message: "Could not update post audience" }
          }

          return { error: false, message: "Post audience updated" }
     } catch (error) {
          console.log(error);
     }
}

module.exports = { UpdatePostAudience }