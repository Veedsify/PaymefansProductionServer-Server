const path = require('path');
const prismaQuery = require('../../utils/prisma');

class uploadMediaController {

    static async attachments(req, res) {
        try {
            const files = req.files;
            const attachments = [];

            async function addFilesToAttachments() {
                files.forEach((file) => {
                    attachments.push({
                        url: file.path.replace("public", "").replace(/\\/g, "/"),
                        name: file.filename,
                        size: file.size,
                        type: file.mimetype,
                        extension: path.extname(file.originalname)
                    });
                });
                return true;
            }

            async function insertAttachments() {
                for (let file of files) {
                    await prismaQuery.userAttachments.create({
                        data: {
                            user_id: Number(req.user.id),
                            path: file.path.replace("public", "").replace(/\\/g, "/"),
                            name: file.filename,
                            size: file.size,
                            type: file.mimetype,
                            extension: path.extname(file.originalname)
                        }
                    });
                }
                return true;
            }

            const [addFiles, insertFiles] = await Promise.all([addFilesToAttachments(), insertAttachments()]);
            if (addFiles && insertFiles) {
                return res.json({ message: "Attachments uploaded successfully", attachments });
            } else {
                return res.json({ message: "An error occured while uploading attachment" });
            }
        } catch (error) {
            console.log(error);
            res.json({ message: "An error occured while uploading attachment" })
        }
    }

}

module.exports = uploadMediaController;