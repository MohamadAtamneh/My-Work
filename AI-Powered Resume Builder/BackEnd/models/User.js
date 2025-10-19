const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Optional base64 or URL for user avatar
  photo:    { type: String },
  // Optional gender for default avatar fallback
  gender:   { type: String, enum: ['male', 'female', 'other'], default: 'other' },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
