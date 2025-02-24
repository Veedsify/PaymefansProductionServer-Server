const { PassThrough } = require("stream");

async function UploadImageCloudflare(image, req) {
    try {
        const UPLOAD_IMAGE = process.env.CLOUDFLARE_IMAGE_UPLOAD;
        const ACCOUNT_HASH = process.env.CLOUDFLARE_ACCOUNT_HASH;

        const stream = new PassThrough();  // Create a stream
        stream.end(image.buffer);  // Stream the buffer instead of storing it

        const formData = new FormData();
        formData.append("file", stream, image.originalname);

        const response = await fetch(UPLOAD_IMAGE, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.CLOUDFLARE_ACCOUNT_TOKEN}`
            },
            body: formData  // Streaming formData
        });

        const uploadedImage = await response.json();
        return {
            public: `https://imagedelivery.net/${ACCOUNT_HASH}/${uploadedImage.result.id}/public`,
            blur: `https://imagedelivery.net/${ACCOUNT_HASH}/${uploadedImage.result.id}/blurred`,
            id: uploadedImage.result.id
        };
    } catch (err) {
        return {
            error: true,
            message: err.message
        };
    }
}

module.exports = UploadImageCloudflare;
