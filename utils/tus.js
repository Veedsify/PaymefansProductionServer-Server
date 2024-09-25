var fs = require('fs');
var tus = require('tus-js-client');
require('dotenv').config();
const path = require('path');

const { CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID } = process.env;

const tusUploader = async (videoData, videoName) => {
    // specify location of file you'd like to upload below
    var file = fs.createReadStream(videoData);
    var size = fs.statSync(videoData).size;
    var type = path.extname(videoData)

    var options = {
        endpoint: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
        headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
        },
        chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
        retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails
        metadata: {
            name: videoName,
            filetype: 'video/mp4',
            // Optional if you want to include a watermark
            // watermark: '<WATERMARK_UID>',
        },
        uploadSize: size,
    };

    return new Promise((resolve, reject) => {
        options.onError = function (error) {
            reject(error);
        };

        options.onProgress = function (bytesUploaded, bytesTotal) {
            var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            console.log(bytesUploaded, bytesTotal, percentage + '%');
        };

        options.onSuccess = function () {
            console.log('Upload finished');
            resolve(mediaId);
        };

        options.onAfterResponse = function (req, res) {
            return new Promise(resolveAfterResponse => {
                var mediaIdHeader = res.getHeader('stream-media-id');
                if (mediaIdHeader) {
                    mediaId = mediaIdHeader;
                }
                resolveAfterResponse();
            });
        };

        var upload = new tus.Upload(file, options);
        upload.start();
    });
};

module.exports = tusUploader;
