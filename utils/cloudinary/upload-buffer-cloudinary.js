const {cloudinary} = require("../cloudinary");

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
                    timeout: 60000,
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
                    timeout: 60000,
                    folder: folder || "all",
                    public_id,
                    eager: [
                        { transformation: 'w_500,h_500', format: 'mp4' }
                    ],
                    eager_async: true,
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

module.exports = {uploadBufferCloudinary, uploadLargeBufferCloudinary};
