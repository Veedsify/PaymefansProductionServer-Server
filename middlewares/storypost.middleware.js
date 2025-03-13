const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const s3 = require("../libs/s3");
const path = require("path")
const { PutObjectCommand } = require("@aws-sdk/client-s3");

// Use memory storage to handle the file buffers
const storage = multer.memoryStorage();

const processImage = async (file) => {
    return new Promise((resolve, reject) => {
        const uniqueSuffix = uuidv4(); // Generate unique suffix
        const newFilename = uniqueSuffix + '.webp';

        sharp(file.buffer)
            .resize({ width: 1000 })
            .toFormat('webp')
            .toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    // Upload to S3
                    const key = `story/${newFilename}`
                    const params = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: key,
                        Body: buffer,
                        ContentType: 'image/webp',
                    };
                    const command = new PutObjectCommand(params)
                    s3.send(command, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(`${process.env.CLOUDFRONT_URL}${key}`); // Return the filename (S3 key)
                        }
                    });
                }
            });
    });
};

const createUploadHandler = (fieldName) => {
    const upload = multer({ storage: storage }).array(fieldName); // Use dynamic field name

    return async (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                return next(err); // Handle multer errors
            }
            try {
                if (req.files && req.files.length > 0) {
                    const fileProcessingPromises = req.files.map(async (file) => {
                        if (file.mimetype.startsWith('image')) {
                            const newFilename = await processImage(file);
                            return { ...file, filename: newFilename };
                        } else {
                            const uniqueSuffix = uuidv4(); // Generate unique suffix
                            const newFilename = uniqueSuffix + path.extname(file.originalname);

                            // Upload non-image files directly to S3
                            const key = `story/${newFilename}`
                            const params = {
                                Bucket: process.env.S3_BUCKET_NAME,
                                Key: key,
                                Body: file.buffer,
                                ContentType: file.mimetype,
                            };

                            return new Promise((resolve, reject) => {
                                const command = new PutObjectCommand(params)
                                s3.send(command, (err, data) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve({ ...file, filename: `${process.env.CLOUDFRONT_URL}${key}` });
                                    }
                                });
                            });
                        }
                    });

                    // Process all files
                    const processedFiles = await Promise.all(fileProcessingPromises);
                    req.files = processedFiles; // Replace req.files with processed files
                }
                next(); // Continue to the next middleware
            } catch (error) {
                console.log(error);
                next(error); // Handle sharp errors
            }
        });
    };
};

module.exports = createUploadHandler;
