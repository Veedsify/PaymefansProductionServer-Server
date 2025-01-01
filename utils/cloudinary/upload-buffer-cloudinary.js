const { cloudinary } = require("../cloudinary");

const uploadBufferCloudinary = async (
  buffer,
  transformations,
  type,
  public_id,
  folder
) => {
  try {
    const file = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder || "all",
            public_id,
            resource_type: type,
            transformation: transformations,
            filename_override: public_id,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    return file;
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      error: true,
      code: error.http_code,
    };
  }
};

const uploadLargeBufferCloudinary = async (
  buffer,
  transformations,
  type,
  public_id,
  folder
) => {
  // Ensure cloudinary is properly initialized before this function is called
  const cloudinary = require("cloudinary").v2; // Example of requiring cloudinary

  try {
    const file = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder || "all", // Default to "all" if no folder is provided
            public_id: public_id, // Use the public_id directly
            eager: [{ width: 300, crop: "pad", audio_codec: "aac" }],
            eager_async: true, // Enable asynchronous eager transformations
            resource_type: type, // Resource type (image, video, etc.)
            transformation: transformations, // Apply any transformations if provided
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer); // Send the buffer to Cloudinary
    });

    return file; // Return the upload result
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      error: true,
      code: error.http_code,
    };
  }
};

module.exports = { uploadBufferCloudinary, uploadLargeBufferCloudinary };
