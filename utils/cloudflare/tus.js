const fs = require('fs');
const tus = require('tus-js-client');
const { appSocket } = require('../socket');
require('dotenv').config();
const socketserver = require('../../libs/io')
const { CLOUDFLARE_ACCOUNT_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;

const tusUploader = async (pathToVideo, file, fileId) => {
    const io = socketserver.getIO()
    try {
        var stream = fs.createReadStream(pathToVideo);
        var size = fs.statSync(pathToVideo).size;
        var mediaId = "";
        var options = {
            endpoint: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
            headers: {
                Authorization: `Bearer ${CLOUDFLARE_ACCOUNT_TOKEN}`,
            },
            chunkSize: 10 * 1024 * 1024, // Required a minimum chunk size of 5 MB. Here we use 50 MB.
            retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails.
            metadata: {
                name: file.filename,
                filetype: "video/mp4",
                // Optional if you want to include a watermark
                // watermark: '<WATERMARK_UID>',
            },
            uploadSize: size,
            onError: function(error) {
                throw error;
            },
            onProgress: function(bytesUploaded, bytesTotal) {
                var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                io.emit("upload-progress", {
                    id: fileId,
                    percentage: percentage,
                });
                console.log(bytesUploaded, bytesTotal, percentage + "%");
            },
            onSuccess: function() {
                console.log("Upload finished");
            },
            onAfterResponse: function(_, res) {
                return new Promise((resolve) => {
                    var mediaIdHeader = res.getHeader("stream-media-id");
                    if (mediaIdHeader) {
                        console.log("Media ID", mediaIdHeader);
                        mediaId = mediaIdHeader;
                    }
                    resolve();
                });
            },
        };

        return new Promise((resolve, reject) => {
            var upload = new tus.Upload(stream, {
                ...options,
                onSuccess: function() {
                    console.log("Upload finished");
                    io.emit("upload-complete", {
                        id: fileId,
                        percentage: 100,
                    });
                    resolve({
                        error: false,
                        message: "Upload completed",
                        mediaId,
                    });
                },
                onError: function(error) {
                    reject(error);
                }
            });
            upload.start();
        });
    } catch (err) {
        console.log(err);
        return {
            error: true,
            message: err
        }
    }
}
module.exports = tusUploader;
