const {
  RekognitionClient,
  CompareFacesCommand,
} = require("@aws-sdk/client-rekognition");
const { S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, SIMILARITY_TRESHOLD } =
  process.env;
const fs = require("fs");

const rekognition = new RekognitionClient({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

const AwsFaceVerification = async (front, back, video, token) => {
  try {
    // convert video url to buffer

    console.log(video, front);

    fs.writeFileSync("video_image.jpg", video);
    fs.writeFileSync("front_image.png", front);

    const compareVideoFaceandFrontIdFace = {
      SourceImage: {
        Bytes: video, // Buffer for the first image
      },
      TargetImage: {
        Bytes: front, // Buffer for the second image
      },
    };
    const command = new CompareFacesCommand(compareVideoFaceandFrontIdFace);
    const data = await rekognition.send(command);

    if (
      data.FaceMatches[0].Similarity >= SIMILARITY_TRESHOLD &&
      data.SourceImageFace.Confidence >= SIMILARITY_TRESHOLD
    ) {
      // Return Data to Client
      return {
        error: false,
        message: "Face Matches With ID",
      };
    } else if (
      data.FaceMatches[0].Similarity > 20 ||
      data.FaceMatches[0].Similarity < 40
    ) {
      return {
        error: true,
        message: "Please Take a Clearer Photo Of Your Id",
      };
    } else {
      return {
        error: true,
        message: "Please use a valid identification card",
      };
    }
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

module.exports = { rekognition, AwsFaceVerification };
