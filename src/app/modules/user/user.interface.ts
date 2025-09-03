/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type TUserRole = 'super-admin' | 'admin' | 'user' | 'supplier' | 'manager';
export type TUserStatus = 'active' | 'blocked';

export interface TUser {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
  emergencyNumber?: string;
  profileImage?: string;
  password: string;
  role: TUserRole;
  status: TUserStatus;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  isPhoneVerified?: boolean;
  phoneVerifiedAt?: Date;
  lastLoginAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends Model<TUser> {
  isUserExistByEmail(email: string): Promise<(TUser & { password?: string }) | null>;
  isPasswordMatch(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimeStamp: Date,
    jwtIssuedTimeStamp: number,
  ): boolean;
}
