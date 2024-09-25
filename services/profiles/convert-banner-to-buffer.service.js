const sharp = require("sharp");

module.exports = async (buffer, width, height) => {
     try {
          const data = await sharp(buffer)
               .resize(width, height)
               .webp({ quality: 100 })
               .toBuffer();
          return data;
     } catch (error) {
          console.log(error);
          return null;
     }
}