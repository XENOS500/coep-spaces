import jwt from "jsonwebtoken";

//Syntax --> jwt.sign(payload, secretOrPrivateKey, options)

const generateToken = (userId) => {
    return jwt.sign( { id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" } );
};

export default generateToken;
