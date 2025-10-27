
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  placeholder: boolean;
  description?: string;
}

export interface Split {
  accountId: string;
  amount: number; // Positive for debit, negative for credit
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  splits: Split[];
}
