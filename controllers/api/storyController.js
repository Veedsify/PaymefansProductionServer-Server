const prismaQuery = require("../../utils/prisma");
const { v4: uuidV4 } = require('uuid');

class StoryController {
    static async UploadStoryFiles(req, res) {
        try {
            const { files } = req;
            const storyFiles = files;
            return res.status(200).json({
                success: true,
                data: storyFiles,
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: "An error occurred while uploading story files",
            })
        }
    }

    // Save Story
    static async SaveStory(req, res) {
        const { stories } = req.body;
        try {
            // Save stories
            const story_id = uuidV4()

            await prismaQuery.userStory.create({
                data: {
                    user_id: req.user.id,
                    story_id,
                    story: "This is a story",
                    storyType: "text",
                    expected_end: new Date() + 24 * 60 * 60 * 1000, // 24 hours
                    StoryMedia: {
                        createMany: {
                            data: [...stories.map((story) => {
                                return {
                                    media_id: uuidV4(),
                                    media_type: story.media_type,
                                    url: story.media_url,
                                }
                            })]
                        }
                    }
                }
            })
            // await prismaQuery.storyMedia.createMany({
            //     data: [
            //         ...stories.map((story) => {
            //             return {
            //                 userId: req.user.id,
            //                 mediaUrl: story.filename,
            //                 mediaType: story.mimetype.startsWith('image') ? 'image' : 'video',
            //             }
            //         })
            //     ]
            // })

            return res.status(200).json({
                success: true,
                data: stories,
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: "An error occurred while saving story",
            })

        }
    }
}

module.exports = StoryController;