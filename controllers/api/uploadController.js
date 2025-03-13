const UploadImageCloudflare = require('../../utils/cloudflare/upload-image-cloudflare');
const tusUploader = require('../../utils/cloudflare/tus');
const sharp = require('sharp');
const { appSocket } = require('../../utils/socket');
const socketserver = require('../../libs/io')
const fs = require('fs')

class UploadController {
    static async uploadImage(req, res) {
        const io = socketserver.getIO()
        try {
            const file = req.file;
            const fileId = req.body.fileId;
            const filePath = req.file.path;
            let upload = {};
            if (file.mimetype.includes('image/')) {
                const fileBuffer = fs.readFileSync(filePath);
                const image = {
                    buffer: fileBuffer,
                    originalname: file.originalname,
                }
                //requires buffer
                const uploadedImage = await UploadImageCloudflare(image, req)
                if (upload.error) {
                    throw new Error(upload.message)
                }
                upload = {
                    ...uploadedImage,
                    type: 'image'
                }
                io.emit("upload-complete", {
                    id: fileId,
                    percentage: 100,
                });
            }

            if (file.mimetype.includes('video/')) {
                const video = await tusUploader(filePath, file, fileId)
                if (!upload.error) {
                    upload = {
                        public: `${process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN}${video.mediaId}/manifest/video.m3u8`,
                        blur: ``,
                        id: video.mediaId,
                        type: 'video'
                    }
                }
            }

            res.json(upload);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: error.message
            })
        }
    }
}

module.exports = UploadController;
