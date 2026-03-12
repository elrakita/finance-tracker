import { Account } from './account'

export interface Transaction {
  success: boolean;
  id: string;
  type: TransactionType;
  balance: number;
  account?: Account; 
}

export enum TransactionType {
  Income = 1,
  Expense = 2
}

export interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  type: TransactionType;
}


export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.Income, label: 'Income' },
  { value: TransactionType.Expense, label: 'Expense' }
];
