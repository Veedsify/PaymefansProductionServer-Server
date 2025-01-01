const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { CLOUDFRONT_URL, SERVER_ORIGINAL_URL } = process.env;
const uploadPostToS3Service = require("../services/posts/upload-post-to-s3.service");
const {
  uploadBufferCloudinary,
  uploadLargeBufferCloudinary,
} = require("./cloudinary/upload-buffer-cloudinary");
const processImage = require("./post_media/process-image");
const processVideo = require("./post_media/process-video");

async function HandleMedia(files, validVideoMimetypes, req) {
  let images = [];
  let videos = [];

  if (!files || files.length === 0) {
    return {
      images: [],
      videos: [],
    };
  }

  for (let file of files) {
    if (validVideoMimetypes.includes(file.mimetype)) {
      videos.push(file);
    } else if (file.mimetype.includes("image")) {
      images.push(file);
    }
  }

  // Process images and videos in parallel
  const imagePromises = images.map((image) => processImage(image, req));
  const videoPromises = videos.map((video) => processVideo(video, req));

  // Wait for all processing to finish
  const [processedImages, processedVideos] = await Promise.all([
    Promise.all(imagePromises),
    Promise.all(videoPromises),
  ]);

  // Check for errors in both image and video processing
  const getErrorsIfAny = [...processedImages, ...processedVideos].filter(
    (media) => media.error,
  );

  if (getErrorsIfAny.length > 0) {
    // Log the first error
    console.log(
      `Error processing all medias: ${JSON.stringify(getErrorsIfAny)}`,
    );
    getErrorsIfAny.forEach((error) =>
      console.log(`Error while processing: ${error.code}`),
    );

    // Return early if there are errors
    return {
      error: true,
      code: getErrorsIfAny[0].code,
    };
  }

  // If no errors, return processed media

  return {
    error: false,
    images: processedImages || [],
    videos: processedVideos || [],
  };
}

module.exports = HandleMedia;
