const {v4: uuidV4} = require('uuid');
const { uploadBufferCloudinary } = require('../../utils/cloudinary/upload-buffer-cloudinary');
const { cloudinary } = require('../../utils/cloudinary');

const uploadFile = async (fileBuffer, fileType) => {
  const fileId = uuidV4();

  // Determine resource type based on file type
  const isImage = fileType.startsWith("image/");
  const resourceType = isImage ? "image" : "video";

  // Create the transformation object for non-image files (e.g., videos)
  const transformation = isImage ? {} : { streaming_profile: "auto" };

  // Upload the file to Cloudinary
  const uploadToCloudinary = await uploadBufferCloudinary(
    fileBuffer,
    transformation,
    resourceType,
    fileId,
    "/verifications"
  );

  // Construct the poster URL for video files
  const poster =
    !isImage &&
    cloudinary.url(uploadToCloudinary.public_id, {
      resource_type: "video",
      transformation: [
        {
          start_offset: 5,
          width: 640,
          height: 480,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
          format: "jpg", 
        },
      ],
    });

  return {
    url: uploadToCloudinary.url,
    poster: poster || null, // Set poster to null if not a video
  };
};

module.exports = { uploadFile };
