import bcrypt from "bcryptjs";
import User from "../models/user.js";
import generateToken from "../src/utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "provide valid name, email and password(8-72 characters)",
    });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "requester",
  });

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
