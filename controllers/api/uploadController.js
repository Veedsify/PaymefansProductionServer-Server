const Busboy = require('busboy');
const UploadImageCloudflare = require('../../utils/cloudflare/upload-image-cloudflare');
class UploadController {
    static async uploadImage(req, res) {
        const file = req.file

        if (file.mimetype.includes('image/')) {
            const upload = await UploadImageCloudflare() >
                res.json(upload)
        }

        if (file.mimetype.includes('video/')) {

        }
    }
}

module.exports = UploadController;
