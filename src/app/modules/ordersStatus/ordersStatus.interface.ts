export interface TOrderStatus {
  name: string;
  description?: string;
  sortOrder?: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}