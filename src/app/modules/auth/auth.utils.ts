import Jwt, { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
export const createToken = (
  jwtPayload: { email: string; role: string },
  secret: string,
  expiresIn: string,
) => {
  return Jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

// verfiy token
export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
