// const multer = require("multer");

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 1 * 1024 * 1024 }, // 5MB
//   fileFilter: (_, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       cb(new Error("Only image files allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// module.exports = upload;
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 1MB per image
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
