import { AccountType } from '../types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
};

export const formatAccountBalance = (amount: number, type: AccountType) => {
  const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(type);
  const displayAmount = isDebitNormal ? amount : -amount;
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    signDisplay: 'auto',
    maximumFractionDigits: 0
  }).format(displayAmount);
};

export const formatRegisterAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      signDisplay: 'never',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
};
