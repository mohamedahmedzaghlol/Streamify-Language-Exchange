import validator from "validator";
import User from "../models/User.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";

export const signup = async(req,res) => {
  const { fullName, email, password} = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const idx = Math.floor(Math.random() * 1000) + 1;
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}&backgroundColor=ffd5dc&style=circle`

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image: randomAvatar,
    });

    const token = jwt.sign({ userId: newUser._id}, process.env.JWT_SECRET,{ expiresIn: "7d"});

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevent XSS Attacks
      sameSite: "strict", //CSRF Protection
      secure: process.env.NODE_ENV === "production", //Use secure cookies in production
    });

    res.status(201).json({user: newUser});

  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error"})
  }
};
export const login = (req,res) => {
  res.send("Login endpoint");
};