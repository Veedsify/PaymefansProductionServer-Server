const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { CLOUDFRONT_URL, SERVER_ORIGINAL_URL } = process.env;
const uploadPostToS3Service = require("../services/posts/upload-post-to-s3.service");
const {
  uploadBufferCloudinary,
  uploadLargeBufferCloudinary,
} = require("./cloudinary/upload-buffer-cloudinary");

async function processImage(image, req) {
  return {
    response: {
      result: {
        image_id: uuidv4(),
        variants: [
          await optimizeImage(image, req),
          await BlurImage(image, req),
        ],
      },
    },
  };
}

async function processVideo(video, req) {
  const fileId = uuidv4();
  const postVideo = await uploadLargeBufferCloudinary(
    video.buffer,
    {
      streaming_profile: "auto", 
    },
    "video",
    fileId,
    "posts/videos"
  );

  console.log(postVideo);

  return {
    video_id: uuidv4(),
    video_url: postVideo.secure_url,
    poster: postVideo.secure_url,
  };
}

async function BlurImage(image, req) {
  const imageId = uuidv4();
  try {
    const postImage = await uploadBufferCloudinary(
      image.buffer,
      {
        width: 1000,
        effect: "blur:2000",
        // gravity: "adv_face", // REQSUBI
      },
      "image",
      imageId,
      "posts/blurs"
    );

    if (!postImage) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    return postImage.secure_url;
  } catch (error) {
    console.log(`Error optimizing image: ${error.message} `);
  }
}

async function optimizeImage(image, req) {
  const imageId = uuidv4();
  try {
    const postImage = await uploadBufferCloudinary(
      image.buffer,
      {
        width: 1000,
        // gravity: "adv_face", // REQSUBI
      },
      "image",
      imageId,
      "posts/uploads"
    );

    if (!postImage) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    return postImage.secure_url;
  } catch (error) {
    console.log(`Error optimizing image: ${error.message} `);
  }
}

async function HandleMedia(files, validVideoMimetypes, req) {
  try {
    const images = [];
    const videos = [];

    for (let file of files) {
      if (validVideoMimetypes.includes(file.mimetype)) {
        videos.push(file);
      } else if (file.mimetype.includes("image")) {
        images.push(file);
      }
    }

    const imagePromises = images.map((image) => processImage(image, req));
    const videoPromises = videos.map((video) => processVideo(video, req));

    const processedImages = await Promise.all(imagePromises);
    const processedVideos = await Promise.all(videoPromises);

    const media = {
      images: [...processedImages],
      videos: [...processedVideos],
    };
    return media;
  } catch (error) {
    console.error(`Error processing media: ${error.message} `);
    return Promise.reject(error);
  }
}

module.exports = HandleMedia;
