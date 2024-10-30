const GetUserStoriesService = require("../../services/story/getuserstories.service");
const prismaQuery = require("../../utils/prisma");
const { v4: uuidV4 } = require("uuid");
const { getVideoDurationInSeconds } = require("get-video-duration");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);
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
      console.log(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while uploading story files",
      });
    }
  }

  // Save Story
  static async SaveStory(req, res) {
    const { stories } = req.body;
    try {
      const getDuration = async (videoUrl) => {
        const duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(videoUrl, (err, metadata) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(metadata.format.duration);
            resolve(metadata.format.duration);
          });
        });
        return Math.floor(duration) * 1000;
      };

      const lengthArray = await Promise.all(
        stories.map(async (story) => {
          if (story.media_type === "video") {
            return await getDuration(story.media_url);
          } else {
            return 5000;
          }
        })
      );

      console.log(lengthArray);

      // Save stories
      const story_id = uuidV4();
      await prismaQuery.userStory.create({
        data: {
          user_id: req.user.id,
          story_id,
          StoryMedia: {
            create: stories.map((story, index) => {
              return {
                media_id: uuidV4(),
                media_type: story.media_type,
                filename: story.media_url,
                url: story.media_url,
                duration:
                  story.media_type === "image"
                    ? Number(5000)
                    : Number(lengthArray[index]),
                story_content: story.caption,
                captionStyle: story.captionStyle,
              };
            }),
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: stories,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while saving story",
      });
    }
  }

  static async GetStories(req, res) {
    const story = await GetUserStoriesService(req.user.id);

    if (story.error) {
      return res.status(500).json({
        success: false,
        message: story.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: story.data,
      count: story.data.length,
    });
  }
}

module.exports = StoryController;
