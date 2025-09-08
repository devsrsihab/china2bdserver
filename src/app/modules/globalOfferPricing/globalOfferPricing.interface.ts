export interface TGlobalOfferPricing {
  offerPercent: number;
  startDate: Date;
  endDate: Date;
  title: string;
  description?: string;
  status: number; // 1 = active, 0 = inactive
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
