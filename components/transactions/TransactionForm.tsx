import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { suggestTransactionSplits } from '../../services/geminiService';
import { Split, Account, AccountType } from '../../types';
import Card from '../ui/Card';

type FormMode = 'simple' | 'advanced';
type SimpleType = 'expense' | 'income' | 'transfer';

const TransactionForm: React.FC = () => {
  const { accounts, addTransaction } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [formMode, setFormMode] = useState<FormMode>('simple');
  const [simpleType, setSimpleType] = useState<SimpleType>('expense');
  
  // State for simple form
  const [amount, setAmount] = useState<number | ''>('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');

  // State for advanced form
  const [splits, setSplits] = useState<Partial<Split>[]>([
    { accountId: '', amount: undefined },
    { accountId: '', amount: undefined },
  ]);

  const {
    assetAccounts,
    liabilityAccounts,
    incomeAccounts,
    expenseAccounts,
    transferAccounts,
    usableAccounts
  } = useMemo(() => {
    const usableAccounts = accounts.filter(a => !a.placeholder);
    return {
      assetAccounts: usableAccounts.filter(a => a.type === AccountType.ASSET),
      liabilityAccounts: usableAccounts.filter(a => a.type === AccountType.LIABILITY),
      incomeAccounts: usableAccounts.filter(a => a.type === AccountType.INCOME),
      expenseAccounts: usableAccounts.filter(a => a.type === AccountType.EXPENSE),
      transferAccounts: usableAccounts.filter(a => [AccountType.ASSET, AccountType.LIABILITY].includes(a.type)),
      usableAccounts: usableAccounts,
    };
  }, [accounts]);

  useEffect(() => {
    const fromAccountParam = searchParams.get('from_account');
    if (fromAccountParam) {
        const account = accounts.find(a => a.id === fromAccountParam);
        if (account) {
            if (account.type === AccountType.EXPENSE || account.type === AccountType.ASSET || account.type === AccountType.LIABILITY) {
                setSimpleType('expense');
                setFromAccountId(fromAccountParam);
            }
             if (account.type === AccountType.INCOME) {
                setSimpleType('income');
                setToAccountId(fromAccountParam);
            }
        }
    }
  }, [searchParams, accounts]);


  const handleSplitChange = (index: number, field: keyof Split, value: string) => {
    const newSplits = [...splits];
    if (field === 'amount') {
      newSplits[index][field] = value ? parseFloat(value) : undefined;
    } else {
      newSplits[index][field] = value;
    }
    setSplits(newSplits);
  };

  const addSplit = () => {
    setSplits([...splits, { accountId: '', amount: undefined }]);
  };

  const removeSplit = (index: number) => {
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description) {
      setError("Description is required.");
      return;
    }

    let finalSplits: Split[] = [];

    if (formMode === 'simple') {
        if (!amount || amount <= 0) {
            setError("A valid amount is required.");
            return;
        }
        if (!fromAccountId || !toAccountId) {
            setError("Both accounts must be selected.");
            return;
        }
        if (fromAccountId === toAccountId) {
            setError("Accounts cannot be the same.");
            return;
        }

        switch(simpleType) {
            case 'expense':
                finalSplits = [
                    { accountId: toAccountId, amount: amount }, // Debit Expense
                    { accountId: fromAccountId, amount: -amount } // Credit Asset/Liability
                ];
                break;
            case 'income':
                 finalSplits = [
                    { accountId: fromAccountId, amount: amount }, // Debit Asset
                    { accountId: toAccountId, amount: -amount } // Credit Income
                ];
                break;
            case 'transfer':
                 finalSplits = [
                    { accountId: toAccountId, amount: amount }, // Debit 'To' account
                    { accountId: fromAccountId, amount: -amount } // Credit 'From' account
                ];
                break;
        }
    } else { // Advanced mode
        finalSplits = splits.filter(s => s.accountId && s.amount != null && s.amount !== 0) as Split[];
        if (finalSplits.length < 2) {
            setError('At least two splits with an account and amount are required.');
            return;
        }

        const total = finalSplits.reduce((sum, s) => sum + s.amount, 0);
        if (Math.abs(total) > 0.001) {
            setError(`The transaction is unbalanced. Debits and credits must be equal. Current total: ${total.toFixed(2)}`);
            return;
        }
    }
    
    setIsSubmitting(true);
    try {
      addTransaction({ date, description, splits: finalSplits });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSimpleForm = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <div className="flex items-center">
                    <input id="expense" name="simple-type" type="radio" checked={simpleType === 'expense'} onChange={() => setSimpleType('expense')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                    <label htmlFor="expense" className="ml-2 block text-sm text-gray-900">Expense</label>
                </div>
                 <div className="flex items-center">
                    <input id="income" name="simple-type" type="radio" checked={simpleType === 'income'} onChange={() => setSimpleType('income')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                    <label htmlFor="income" className="ml-2 block text-sm text-gray-900">Income</label>
                </div>
                 <div className="flex items-center">
                    <input id="transfer" name="simple-type" type="radio" checked={simpleType === 'transfer'} onChange={() => setSimpleType('transfer')} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"/>
                    <label htmlFor="transfer" className="ml-2 block text-sm text-gray-900">Transfer</label>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                     <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                     <input type="number" step="0.01" id="amount" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                {simpleType === 'expense' && (<>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Paid From</label>
                        <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="" disabled>Select account...</option>
                            {transferAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                             <option value="" disabled>Select category...</option>
                             {expenseAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                </>)}
                 {simpleType === 'income' && (<>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deposited To</label>
                        <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="" disabled>Select account...</option>
                            {assetAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="" disabled>Select category...</option>
                            {incomeAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                </>)}
                 {simpleType === 'transfer' && (<>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">From Account</label>
                        <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="" disabled>Select account...</option>
                            {transferAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">To Account</label>
                        <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="" disabled>Select account...</option>
                            {transferAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                </>)}
            </div>
        </div>
    );
  }

  const renderAdvancedForm = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Splits</h3>
        {splits.map((split, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <select value={split.accountId || ''} onChange={e => handleSplitChange(index, 'accountId', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="" disabled>Select an account</option>
                {usableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
               <input type="number" step="0.01" placeholder="Debit" value={split.amount === undefined || split.amount < 0 ? '' : split.amount}
                  onChange={e => handleSplitChange(index, 'amount', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div className="col-span-2">
               <input type="number" step="0.01" placeholder="Credit" value={split.amount === undefined || split.amount > 0 ? '' : Math.abs(split.amount)}
                  onChange={e => handleSplitChange(index, 'amount', `-${e.target.value}`)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div className="col-span-2 flex justify-end">
              {splits.length > 2 && (
                <button type="button" onClick={() => removeSplit(index)} className="text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addSplit} className="text-sm text-primary hover:text-indigo-800">+ Add another split</button>
      </div>
    );
  }

  return (
    <Card title="New Transaction">
      <form onSubmit={validateAndSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
        </div>
        
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button type="button" onClick={() => setFormMode('simple')} className={`${formMode === 'simple' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Simple
                </button>
                <button type="button" onClick={() => setFormMode('advanced')} className={`${formMode === 'advanced' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Advanced (Splits)
                </button>
            </nav>
        </div>

        {formMode === 'simple' ? renderSimpleForm() : renderAdvancedForm()}
        
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button type="button" onClick={() => navigate(-1)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300">Save Transaction</button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;
