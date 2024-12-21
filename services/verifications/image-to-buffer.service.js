const axios = require("axios");
const sharp = require("sharp");
const convertImageUrlToBuffer = async (imageUrl) => {
  try {
    // Fetch the image from the URL
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "arraybuffer", // This ensures the response is returned as a buffer
    });

    // Convert the response data to a Buffer
    const imageBuffer = Buffer.from(response.data);
    const image = sharp(imageBuffer).jpeg().toBuffer();
    return image;
  } catch (error) {
    console.error("Error fetching the image:", error);
    throw error;
  }
};

module.exports = { convertImageUrlToBuffer };
