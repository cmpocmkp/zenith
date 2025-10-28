import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Account, Transaction, Split, AccountType } from '../types';
import { INITIAL_ACCOUNTS } from '../constants';
import { apiService } from '../services/apiService';

// fiscalYear-accountId -> amount
type Budgets = Record<string, number>;

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budgets;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getAccountBalance: (accountId: string, endDate?: string) => number;
  getTransactionsForAccount: (accountId:string) => Transaction[];
  getAccountHierarchy: (parentId?: string | null) => { account: Account; children: any[]; depth: number }[];
  findAccount: (accountId: string) => Account | undefined;
  addAccount: (account: Omit<Account, 'id'>, openingBalance?: { amount: number; date: string }) => void;
  updateAccount: (account: Account, openingBalance?: { amount: number; date: string }) => void;
  setBudget: (fiscalYear: number, accountId: string, amount: number) => void;
  getOpeningBalance: (accountId: string) => { transactionId: string, amount: number, date: string } | null;
  // Expose setters for data import
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setBudgets: React.Dispatch<React.SetStateAction<Budgets>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// MongoDB-based state management
const useMongoState = <T,>(
  loadFn: () => Promise<T>,
  saveFn: (data: T) => Promise<void>,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from MongoDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadFn();
        setState(data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data from MongoDB:', error);
        setState(defaultValue);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []); // Empty dependency array - only run on mount

  // Save data to MongoDB when state changes (but not on initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveData = async () => {
      try {
        await saveFn(state);
      } catch (error) {
        console.error('Error saving data to MongoDB:', error);
      }
    };
    saveData();
  }, [state, isLoaded]); // Remove saveFn from dependencies to prevent infinite loop

  return [state, setState];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Memoize API functions to prevent infinite loops
  const loadAccounts = useCallback(() => apiService.getAccounts(), []);
  const saveAccounts = useCallback((data: Account[]) => apiService.saveAccounts(data), []);
  const loadTransactions = useCallback(() => apiService.getTransactions(), []);
  const saveTransactions = useCallback((data: Transaction[]) => apiService.saveTransactions(data), []);
  const loadBudgets = useCallback(() => apiService.getBudgets(), []);
  const saveBudgets = useCallback((data: Budgets) => apiService.saveBudgets(data), []);

  const [accounts, setAccounts] = useMongoState<Account[]>(
    loadAccounts,
    saveAccounts,
    INITIAL_ACCOUNTS
  );
  const [transactions, setTransactions] = useMongoState<Transaction[]>(
    loadTransactions,
    saveTransactions,
    []
  );
  const [budgets, setBudgets] = useMongoState<Budgets>(
    loadBudgets,
    saveBudgets,
    {}
  );

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      id: `txn_${new Date().getTime()}_${Math.random()}`,
      ...transaction
    };
    try {
      await apiService.addTransaction(newTransaction);
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id'>, openingBalance?: { amount: number; date: string }) => {
    const newAccount: Account = {
      id: `acc_${new Date().getTime()}_${Math.random()}`,
      ...accountData
    };
    
    try {
      await apiService.addAccount(newAccount);
      setAccounts(prev => [...prev, newAccount]);

      if (openingBalance && openingBalance.amount !== 0 && !newAccount.placeholder) {
          const openingBalanceAccount = accounts.find(a => a.id === 'equity-opening');
          if (!openingBalanceAccount) {
              console.error("Core Account 'Opening Balances' not found! Cannot create opening balance transaction.");
              return;
          }

          const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(newAccount.type);
          const amount = isDebitNormal ? openingBalance.amount : -openingBalance.amount;

          const transaction: Omit<Transaction, 'id'> = {
              date: openingBalance.date,
              description: `Opening Balance for ${newAccount.name}`,
              splits: [
                  { accountId: newAccount.id, amount: amount },
                  { accountId: openingBalanceAccount.id, amount: -amount }
              ]
          };
          await addTransaction(transaction);
      }
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const updateAccount = async (updatedAccount: Account, openingBalance?: { amount: number; date: string }) => {
    try {
      // 1. Update account details in API
      await apiService.updateAccount(updatedAccount);
      setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));

      // 2. Find any existing opening balance transaction for this account
      const existingObTxn = transactions.find(t => 
          t.splits.length === 2 &&
          t.splits.some(s => s.accountId === updatedAccount.id) &&
          t.splits.some(s => s.accountId === 'equity-opening')
      );
      
      // 3. Filter out the old transaction if it exists
      let newTransactions = transactions;
      if (existingObTxn) {
          await apiService.deleteTransaction(existingObTxn.id);
          newTransactions = transactions.filter(t => t.id !== existingObTxn.id);
      }

      // 4. Add a new opening balance transaction if a new balance is provided
      if (openingBalance && openingBalance.amount !== 0 && !updatedAccount.placeholder) {
           const openingBalanceAccount = accounts.find(a => a.id === 'equity-opening');
           if (!openingBalanceAccount) {
              console.error("Core Account 'Opening Balances' not found! Cannot create opening balance transaction.");
              setTransactions(newTransactions); // still save the filtered txns
              return;
          }

          const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(updatedAccount.type);
          const amount = isDebitNormal ? openingBalance.amount : -openingBalance.amount;
          
          const newObTransaction: Transaction = {
            id: `txn_ob_${updatedAccount.id}_${new Date().getTime()}`,
            date: openingBalance.date,
            description: `Opening Balance for ${updatedAccount.name}`,
            splits: [
              { accountId: updatedAccount.id, amount: amount },
              { accountId: openingBalanceAccount.id, amount: -amount }
            ]
          };
          await apiService.addTransaction(newObTransaction);
          newTransactions = [...newTransactions, newObTransaction];
      }
      
      // 5. Set the final, updated list of transactions
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const setBudget = (fiscalYear: number, accountId: string, amount: number) => {
    const key = `${fiscalYear}-${accountId}`;
    setBudgets(prev => ({ ...prev, [key]: amount }));
  };

  const getAccountBalance = useCallback((accountId: string, endDateStr?: string): number => {
    const endDate = endDateStr ? new Date(endDateStr) : null;
    if(endDate) endDate.setHours(23, 59, 59, 999);

    const childAccounts = accounts.filter(a => a.parentId === accountId);

    const relevantTransactions = endDate 
        ? transactions.filter(t => new Date(t.date) <= endDate)
        : transactions;

    const selfBalance = relevantTransactions.reduce((balance, txn) => {
      const relevantSplit = txn.splits.find(s => s.accountId === accountId);
      return balance + (relevantSplit ? relevantSplit.amount : 0);
    }, 0);

    return childAccounts.reduce((sum, child) => sum + getAccountBalance(child.id, endDateStr), selfBalance);

  }, [transactions, accounts]);
  
  const getTransactionsForAccount = useCallback((accountId: string): Transaction[] => {
    return transactions
      .filter(txn => txn.splits.some(s => s.accountId === accountId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const findAccount = useCallback((accountId: string) => {
    return accounts.find(a => a.id === accountId);
  }, [accounts]);

  const getAccountHierarchy = useCallback((parentId: string | null = null, depth = 0): { account: Account; children: any[], depth: number }[] => {
    return accounts
      .filter(account => account.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(account => ({
        account,
        children: getAccountHierarchy(account.id, depth + 1),
        depth,
      }));
  }, [accounts]);

  const getOpeningBalance = useCallback((accountId: string): { transactionId: string, amount: number, date: string } | null => {
    const account = findAccount(accountId);
    if (!account) return null;

    // An opening balance transaction has 2 splits: one to the account, one to the Opening Balances account.
    const obTxn = transactions.find(t => 
        t.splits.length === 2 &&
        t.splits.some(s => s.accountId === accountId) &&
        t.splits.some(s => s.accountId === 'equity-opening')
    );

    if (!obTxn) return null;
    
    const split = obTxn.splits.find(s => s.accountId === accountId);
    if (!split) return null;
    
    const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(account.type);
    // The amount in the split is the "accounting" amount (debit positive, credit negative).
    // The opening balance input should be a simple positive number from the user's perspective.
    const displayAmount = isDebitNormal ? split.amount : -split.amount;

    return { transactionId: obTxn.id, amount: displayAmount, date: obTxn.date };
}, [transactions, findAccount, accounts]);


  const value = { accounts, transactions, budgets, addTransaction, getAccountBalance, getTransactionsForAccount, findAccount, getAccountHierarchy, addAccount, updateAccount, setBudget, getOpeningBalance, setAccounts, setTransactions, setBudgets };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};