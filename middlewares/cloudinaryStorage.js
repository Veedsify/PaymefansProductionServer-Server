const { cloudinary } = require("../utils/cloudinary");
const multer = require("multer");

// Define file type checker
const fileFilter = (req, file, cb) => {
  // Allowed image formats
  const imageFormats = ["image/jpeg", "image/png", "image/gif"];
  // Allowed video formats
  const videoFormats = ["video/mp4", "video/quicktime", "video/x-msvideo"];

  if (
    imageFormats.includes(file.mimetype) ||
    videoFormats.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only images (JPG, PNG, GIF) and videos (MP4, MOV, AVI) are allowed.",
      ),
      false,
    );
  }
};

// // Configure separate storages for images and videos
// const imageStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "images",
//     allowed_formats: ["jpg", "jpeg", "png", "gif"],
//     transformation: [
//       { width: 1000, height: 1000, crop: "limit" },
//       { effect: "blur:300" },
//     ],
//   },
// });

// const videoStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "videos",
//     allowed_formats: ["mp4", "mov", "avi"],
//     resource_type: "video",
//   },
// });

// Initialize multer with file type detection
const upload = multer({
  storage: multer.memoryStorage(), // Temporary memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

// Middleware to handle file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size is too large. Maximum size is 100MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
};

// Helper function to upload to Cloudinary with appropriate settings
const uploadToCloudinary = async (file) => {
  const isVideo = file.mimetype.startsWith("video/");
  let uploadOptions;

  const videoOptions = {
    resource_type: "video",
    transformation: {
      streaming_profile: "auto",
      format: "hls",
      fetch_format: "auto",
    },
    eager: [{ width: 300, crop: "pad", audio_codec: "aac" }],
    eager_async: true, // Enable asynchronous eager transformations
    folder: "videos",
  };

  const imageOptions = {
    resource_type: "image",
    transformation: {
      width: 1000,
    },
    folder: "images", // Fixed 'folders' to 'folder'
  };

  const blurredImageOption = {
    resource_type: "image",
    transformation: {
      effect: "blur:5000",
    },
    folder: "images/blur",
  };

  uploadOptions = isVideo ? videoOptions : imageOptions;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

module.exports = {
  uploadFIles: upload,
  // imageStorage,
  // videoStorage,
  handleUploadError,
  uploadToCloudinary,
};
