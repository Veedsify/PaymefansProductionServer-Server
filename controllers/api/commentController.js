const sharp = require("sharp")
const { uploadToCloudflareImage } = require("../../utils/cloudflare")
const prismaQuery = require("../../utils/prisma")
const { v4: uuid } = require("uuid")
const s3 = require("../../libs/s3")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
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

            async function uploadToS3() {
                if (files) {
                    const uploadPromises = files.map(async (element) => {
                        const commentId = `comments/${uuid()}`;
                        const buffer = await sharp(element.buffer).resize(700).webp().toBuffer(); // Await the buffer
                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: commentId,
                            Body: buffer,
                            ContentType: element.mimetype,
                        };
                        const command = new PutObjectCommand(params);
                        await s3.send(command);
                        return commentId;
                    });
                    return Promise.all(uploadPromises); // Return all promises
                }
            }

            const commentAttachments = await uploadToS3()
            await prismaQuery.postCommentAttachments.createMany({
                data: commentAttachments.map((attachment) => {
                    return {
                        comment_id: newComment.id,
                        name: attachment,
                        path: `${process.env.CLOUDFRONT_URL}${attachment}`,
                        type: "image",
                    };
                })
            })

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
}


module.exports = CommentController