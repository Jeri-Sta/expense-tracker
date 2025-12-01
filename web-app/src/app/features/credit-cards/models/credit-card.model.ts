export interface CreditCard {
  id: string;
  name: string;
  color: string;
  closingDay: number;
  dueDay: number;
  totalLimit: number;
  usedLimit?: number;
  availableLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCreditCardDto {
  name: string;
  color?: string;
  closingDay: number;
  dueDay: number;
  totalLimit: number;
}

export interface UpdateCreditCardDto {
  name?: string;
  color?: string;
  closingDay?: number;
  dueDay?: number;
  totalLimit?: number;
  isActive?: boolean;
}
