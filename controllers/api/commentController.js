const sharp = require("sharp")
const { uploadToCloudflareImage } = require("../../utils/cloudflare")
const prismaQuery = require("../../utils/prisma")
const { v4: uuid } = require("uuid")
const s3 = require("../../libs/s3")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { uploadBufferCloudinary } = require("../../utils/cloudinary/upload-buffer-cloudinary")
const CommentLikesService = require("../../services/comments/commentLikes.service")
require('dotenv').config()

class CommentController {
    static async NewPostComment(req, res) {
        try {
            const { id } = req.user
            const { post_id: postStringId, postId, reply_to, comment, attachments } = req.body
            const { files } = req.files
            const comment_id = uuid();

            const newComment = await prismaQuery.postComment.create({
                data: {
                    comment: comment,
                    comment_id: comment_id,
                    post_id: parseInt(postId),
                    user_id: parseInt(id),
                },
            })

            await prismaQuery.post.update({
                where: {
                    id: parseInt(postId)
                },
                data: {
                    post_comments: {
                        increment: 1
                    }
                }
            })

            async function uploadToCloudinary() {
                if (files) {
                    const uploadPromises = files.map(async (element) => {
                        const file = element
                        const fileBuffer = await sharp(file.buffer).resize({ width: 800 }).toBuffer()
                        const transformations = {
                            quality: "auto",
                        }
                        const upload = await uploadBufferCloudinary(fileBuffer, transformations, "image", file.filename, "comments")
                        return upload.secure_url
                    });
                    return Promise.all(uploadPromises); // Return all promises
                }
            }

            if (files) {
                const commentAttachments = await uploadToCloudinary()
                await prismaQuery.postCommentAttachments.createMany({
                    data: commentAttachments.map((attachment) => {
                        return {
                            comment_id: newComment.id,
                            name: attachment,
                            path: `${attachment}`,
                            type: "image",
                        };
                    })
                })
            }

            const thisComment = await prismaQuery.postComment.findUnique({
                where: {
                    id: newComment.id
                },
                select: {
                    id: true,
                    comment: true,
                    comment_id: true,
                    post_id: true,
                    user_id: true,
                    created_at: true,
                    updated_at: true,
                    PostCommentAttachments: true
                }
            })

            prismaQuery.$disconnect()
            res.json({
                status: true,
                message: 'Comment created successfully',
                data: thisComment
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: false,
                message: 'An error occured while creating comment'
            })
        }
    }

    // Comments Attachments
    static async CommentsAttachMents(req, res) {
        try {
            const file = req.file
            const { id } = req.user

            const upload = await uploadToCloudflareImage(file.path, process.env.CLOUDFLARE_API_KEY)

            if (!upload) {
                return res.status(500).json({
                    status: false,
                    message: 'An error occured while uploading attachment'
                })
            }

            const attachment = await prismaQuery.postCommentAttachments.create({
                data: {
                    name: file.filename,
                    path: upload.response.result.variants.find((variant) => variant.includes('/public')),
                    type: file.mimetype.replace('image/', '')
                }
            })

            prismaQuery.$disconnect()

            res.json({
                status: true,
                message: 'Attachment uploaded successfully',
                data: attachment
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: false,
                message: 'An error occured while uploading attachment'
            })
        }
    }

    // New Comment Like
    static async NewCommentLike(req, res) {
        const { id } = req.user
        const { commentId } = req.body

        const commentLike = await CommentLikesService().create(commentId, id)
        if (commentLike.error) {
            return res.status(500).json({
                status: false,
                message: 'An error occured while liking comment'
            })
        }

        res.json({
            status: true,
            message: commentLike.message
        })
    }
}


module.exports = CommentController
