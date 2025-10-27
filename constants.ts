import { Account, AccountType } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  // Root Accounts
  { id: 'root-asset', name: 'Assets', type: AccountType.ASSET, parentId: null, placeholder: true },
  { id: 'root-liability', name: 'Liabilities', type: AccountType.LIABILITY, parentId: null, placeholder: true },
  { id: 'root-equity', name: 'Equity', type: AccountType.EQUITY, parentId: null, placeholder: true },
  { id: 'root-income', name: 'Income', type: AccountType.INCOME, parentId: null, placeholder: true },
  { id: 'root-expense', name: 'Expenses', type: AccountType.EXPENSE, parentId: null, placeholder: true },
  
  // Assets
  { id: 'asset-current', name: 'Current Assets', type: AccountType.ASSET, parentId: 'root-asset', placeholder: true },
  { id: 'asset-bank', name: 'Bank Account', type: AccountType.ASSET, parentId: 'asset-current', placeholder: false },
  { id: 'asset-cash', name: 'Cash in Hand', type: AccountType.ASSET, parentId: 'asset-current', placeholder: false },
  
  // Liabilities
  { id: 'liability-payable', name: 'Accounts Payable', type: AccountType.LIABILITY, parentId: 'root-liability', placeholder: false },
  
  // Equity
  { id: 'equity-opening', name: 'Opening Balances', type: AccountType.EQUITY, parentId: 'root-equity', placeholder: false },
  { id: 'equity-retained', name: 'Retained Earnings', type: AccountType.EQUITY, parentId: 'root-equity', placeholder: false },

  // Income
  { id: 'income-fees', name: 'Tuition Fees', type: AccountType.INCOME, parentId: 'root-income', placeholder: false },
  { id: 'income-donations', name: 'Donations', type: AccountType.INCOME, parentId: 'root-income', placeholder: false },
  { id: 'income-other', name: 'Other Income', type: AccountType.INCOME, parentId: 'root-income', placeholder: false },
  
  // Expenses
  { id: 'expense-salaries', name: 'Salaries', type: AccountType.EXPENSE, parentId: 'root-expense', placeholder: false },
  { id: 'expense-rent', name: 'Rent', type: AccountType.EXPENSE, parentId: 'root-expense', placeholder: false },
  { id: 'expense-utilities', name: 'Utilities', type: AccountType.EXPENSE, parentId: 'root-expense', placeholder: true },
  { id: 'expense-utilities-electricity', name: 'Electricity Bill', type: AccountType.EXPENSE, parentId: 'expense-utilities', placeholder: false },
  { id: 'expense-utilities-internet', name: 'Internet Bill', type: AccountType.EXPENSE, parentId: 'expense-utilities', placeholder: false },
  { id: 'expense-supplies', name: 'Office & School Supplies', type: AccountType.EXPENSE, parentId: 'root-expense', placeholder: false },
  { id: 'expense-maintenance', name: 'Maintenance & Repairs', type: AccountType.EXPENSE, parentId: 'root-expense', placeholder: false },
];