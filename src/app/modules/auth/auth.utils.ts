import jwt, { JwtPayload } from "jsonwebtoken";
import { TUserRole } from "../user/user.interface"; // adjust import path

// Define a reusable payload type
export type TJwtPayload = {
  email?: string;  // optional
  phone?: string;  // optional
  role: TUserRole; // required
};

// Create token
export const createToken = (
  jwtPayload: TJwtPayload,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

// Verify token
export const verifyToken = (token: string, secret: string): JwtPayload & TJwtPayload => {
  return jwt.verify(token, secret) as JwtPayload & TJwtPayload;
};
