export interface Account {
  success: boolean;
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  Checking = 1,
  Savings = 2,
  CreditCard = 3
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors: string[];
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.Checking, label: 'Checking' },
  { value: AccountType.Savings, label: 'Savings' },
  { value: AccountType.CreditCard, label: 'Credit Card' }
];
