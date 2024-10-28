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
                    StoryMedia: {
                        create: stories.map((story) => ({
                            media_id: uuidV4(),
                            media_type: story.media_type,
                            filename: story.media_url,
                            url: story.media_url,
                            story_content: story.caption,
                            captionStyle: story.captionStyle,
                        })),
                    },
                },
            });            

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