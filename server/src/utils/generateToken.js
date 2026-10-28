import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    }
  );
};

export default generateToken;