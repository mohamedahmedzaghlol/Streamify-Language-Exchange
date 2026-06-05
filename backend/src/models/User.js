import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  skill: { type: String, default: "" },
  language: { type: String, default: "" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  isOnboarded: { type: Boolean, default: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
}, {timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;