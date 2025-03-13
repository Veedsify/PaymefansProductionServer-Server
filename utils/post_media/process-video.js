const { v4: uuidv4 } = require("uuid");
const {
  uploadLargeBufferCloudinary,
} = require("../cloudinary/upload-buffer-cloudinary");

async function processVideo(video, req) {
  const fileId = uuidv4();
  const postVideo = await uploadLargeBufferCloudinary(
    video.buffer,
    {
      streaming_profile: "auto",
      format: "hls",
      fetch_format: "auto",
    },
    "video",
    fileId,
    "posts/videos",
  );

  if (postVideo.error) {
    console.log(`Error processing video: ${postVideo.code}`);
    return {
      error: true,
      code: postVideo.code,
    };
  }

  return {
    video_id: uuidv4(),
    video_url: postVideo.playback_url,
    poster: postVideo.secure_url,
  };
}

module.exports = processVideo;
