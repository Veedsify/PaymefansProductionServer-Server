const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const path = require('path');
const tusOploader = require('./cloudflare/tus');
const homeDir = path.join(__dirname, '..');

const processPostMedia = async (files, req, validVideoMimetypes, SERVER_ORIGINAL_URL, apiToken) => {
    console.log(
        files.map((file) => ({
            mimetype: file.mimetype,
            size: file.size,
            path: path.join(homeDir, file.path),
        }))
    );

    const mediaPromises = files.map(async (file) => {
        const filePath = path.join(homeDir, file.path);
        if (validVideoMimetypes.includes(file.mimetype)) {
            const uniqueFileName = `${uuid()}-${file.originalname}`;
            return await uploadToCloudflareVideo(filePath, uniqueFileName, apiToken);
        } else if (file.mimetype.includes("image")) {
            return await uploadToCloudflareImage(filePath, apiToken);
        }
    });

    const mediaResults = await Promise.all(mediaPromises);
    const videos = mediaResults.filter(result => result && result.type === 'video');
    const images = mediaResults.filter(result => result && result.type === 'image');

    return { videos, images };
};

const execCurlCommand = (command) => {
    try {
        return new Promise((resolve, reject) => {
            exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Command failed: ${stderr}`);
                    reject(new Error(`Command failed: ${stderr}`));
                    return;
                }
                try {
                    const response = JSON.parse(stdout);
                    if (!response.success) {
                        reject(new Error(`Failed to upload: ${stdout}`));
                    } else {
                        resolve(response);
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse response: ${parseError.message}`));
                }
            });
        });
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        return Promise.reject(error);
    }
};

const uploadToCloudflareImage = async (filePath, apiToken) => {
    const sanitizedFilePath = path.resolve(filePath);
    console.log(sanitizedFilePath, "Sanitzd path")
    const curlCommand = `curl -X POST "https://api.cloudflare.com/client/v4/accounts/068a98897652d9a679a7654f90eebb2c/images/v1" -H "Authorization: Bearer ${apiToken}" -F "file=@${sanitizedFilePath}"`;
    return execCurlCommand(curlCommand).then(response => ({ type: 'image', response }));
};

const uploadToCloudflareVideo = async (filePath, videoName, apiToken) => {
    const sanitizedFilePath = path.resolve(filePath);
    const upload = await tusOploader(sanitizedFilePath, videoName);
    return { type: 'video', id: upload };
};

module.exports = {
    processPostMedia,
    uploadToCloudflareImage,
    uploadToCloudflareVideo
};
