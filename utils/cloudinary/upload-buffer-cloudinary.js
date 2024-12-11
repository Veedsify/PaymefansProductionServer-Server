const { cloudinary } = require("../cloudinary");

const uploadBufferCloudinary = async (
  buffer,
  transformations,
  type,
  public_id,
  folder
) => {
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
};

const uploadLargeBufferCloudinary = async (
  buffer,
  transformations,
  type,
  public_id,
  folder,
) => {
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
};

module.exports = { uploadBufferCloudinary, uploadLargeBufferCloudinary };
