const { v4: uuidv4 } = require("uuid");
const {
  uploadBufferCloudinary,
} = require("../cloudinary/upload-buffer-cloudinary");
async function BlurImage(image, req) {
  const imageId = uuidv4();
  const postImage = await uploadBufferCloudinary(
    image.buffer,
    {
      width: 1000,
      effect: "blur:2599",
      // gravity: "adv_face", // REQSUBI
    },
    "image",
    imageId,
    "posts/blurs",
  );

  if (postImage.error) {
    console.log(`Error bluring image: ${postImage.error}`);
    return {
      error: true,
      code: postImage.code,
    };
  }

  return postImage.secure_url;
}

async function OptimizeImage(image, req) {
  const imageId = uuidv4();
  const postImage = await uploadBufferCloudinary(
    image.buffer,
    {
      width: 1000,
    },
    "image",
    imageId,
    "posts/uploads",
  );

  if (postImage.error) {
    console.log(`Error optimizing image: ${postImage.error}`);
    return {
      error: true,
      code: postImage.code,
    };
  }

  return postImage.secure_url;
}

async function processImage(image, req) {
  const optimizedImage = await OptimizeImage(image, req);
  const blurredImage = await BlurImage(image, req);

  if (optimizedImage.error || blurredImage.error) {
    return {
      error: true,
      code: optimizedImage.error
        ? optimizedImage.error.code
        : blurredImage.error.code,
    };
  }

  return {
    response: {
      result: {
        image_id: uuidv4(),
        variants: [optimizedImage, blurredImage],
      },
    },
  };
}

module.exports = processImage;