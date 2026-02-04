const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },

  address: String,
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },

  password: String,

  googleId: String,

  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isBlocked: {
  type: Boolean,
  default: false,
},
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
