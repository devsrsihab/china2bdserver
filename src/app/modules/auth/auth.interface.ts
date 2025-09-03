export type TLoginUser = {
  email: string;
  password: string;
};

// user.interface.ts

export type TUserRole = 'user' | 'admin' | 'supplier' | 'manager';
export type TUserStatus = 'active' | 'inactive' | 'banned';

export type TRegisterUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  district?: string;
  city?: string;
  emergencyNumber?: string;
  profileImage?: string;
  role?: TUserRole; // default 'user'
  status?: TUserStatus; // default 'active'
};
