import * as dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const bearerHeaders = req.headers.authorization;
        if(!bearerHeaders) {
            throw{message: "Se necesita el token de seguridad"};
        }
        const token = bearerHeaders.split(" ")[1]; 
        const payload = jwt.verify(token, process.env.JWT_PASS);
        req.email = payload.email;
        next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({message:error.message});
  }
}