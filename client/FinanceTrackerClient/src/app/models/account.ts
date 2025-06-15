export interface Account {
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
