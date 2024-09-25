const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const {CLOUDFRONT_URL, SERVER_ORIGINAL_URL} = process.env;
const uploadPostToS3Service = require('../services/posts/upload-post-to-s3.service');

async function processImage(image) {
    return {
        response: {
            result: {
                image_id: uuidv4(),
                variants: [
                    await optimizeImage(image),
                    await BlurImage(image)
                ]
            }
        }
    };
}

async function processVideo(video) {
    const fileId = uuidv4()
    const filepath = `posts/videos/${fileId}`;
    const uploadPostToS3 = await uploadPostToS3Service(video.buffer, video.mimetype, filepath);
    if(!uploadPostToS3) {
        throw new Error("Failed to upload image to S3");
    }
    return {
        video_id: uuidv4(),
        video_url: `${CLOUDFRONT_URL}${filepath}`,
        poster: `${SERVER_ORIGINAL_URL}/images/poster.png`
    };
}

async function BlurImage(image) {
    try {
        const imageFile = await sharp(image.buffer)
            .resize(950)
            .blur(200)
            .toBuffer();

        const fileId = uuidv4()
        const filepath = `posts/blurs/${fileId}`;
        const uploadPostToS3 = await uploadPostToS3Service(imageFile, image.mimetype, filepath);
        if(!uploadPostToS3) {
            throw new Error("Failed to upload image to S3");
        }
        return `${CLOUDFRONT_URL}${filepath} `;
    }catch (error) {
        console.log(`Error optimizing image: ${error.message} `);
    }
}

async function optimizeImage(image) {
    try {
        const imageFile = await sharp(image.buffer)
            .resize(950)
            .toBuffer();
        const fileId = uuidv4()
        const filepath = `posts/uploads/${fileId}`;
        const uploadPostToS3 = await uploadPostToS3Service(imageFile, image.mimetype, filepath);
        if(!uploadPostToS3) {
            throw new Error("Failed to upload image to S3");
        }
        return `${CLOUDFRONT_URL}${filepath} `;
    }catch (error) {
        console.log(`Error optimizing image: ${error.message} `);
    }
}

async function HandleMedia(files, validVideoMimetypes) {
    try {
        const images = [];
        const videos = [];

        for (let file of files) {
            if (validVideoMimetypes.includes(file.mimetype)) {
                videos.push(file);
            } else if (file.mimetype.includes("image")) {
                images.push(file);
            }
        }

        const imagePromises = images.map(image => processImage(image));
        const videoPromises = videos.map(video => processVideo(video));

        const processedImages = await Promise.all(imagePromises);
        const processedVideos = await Promise.all(videoPromises);

        const media = { images: [...processedImages], videos: [...processedVideos] }
        return media;
    } catch (error) {
        console.error(`Error processing media: ${error.message} `);
        return Promise.reject(error);
    }
}

module.exports = HandleMedia;
