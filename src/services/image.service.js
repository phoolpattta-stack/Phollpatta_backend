const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

exports.uploadProductImages = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const compressedBuffer = await sharp(file.buffer)
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 70 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      ).end(compressedBuffer);
    });
  });

  return Promise.all(uploadPromises);
};
