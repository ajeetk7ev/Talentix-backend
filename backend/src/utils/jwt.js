import jwt from 'jsonwebtoken';
import env from '../config/env.js';


export const generateToken = async (user) => {
     const payload = {
        id:user.id,
        email:user.email,
        role:user.role
     }

     const token = await jwt.sign(payload, env.JWT_SECRET, {expiresIn:'7d'});

     return token;
}

export const verifyToken = async (token) => {
   const decoded = await jwt.verify(token, env.JWT_SECRET);
   return decoded;
}