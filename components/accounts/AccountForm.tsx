import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Account, AccountType } from '../../types';
import Card from '../ui/Card';

const getFiscalYear = (date: Date) => {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
};

const getFiscalYearStart = (year: number) => {
    return new Date(year, 6, 1);
};


const AccountForm: React.FC = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const { accounts, findAccount, addAccount, updateAccount, getOpeningBalance } = useData();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<AccountType>(AccountType.EXPENSE);
    const [parentId, setParentId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State for opening balance
    const [openingBalance, setOpeningBalance] = useState<number | ''>('');
    const [openingBalanceDate, setOpeningBalanceDate] = useState(getFiscalYearStart(getFiscalYear(new Date())).toISOString().split('T')[0]);


    useEffect(() => {
        if (accountId) {
            const account = findAccount(accountId);
            if (account) {
                setName(account.name);
                setDescription(account.description || '');
                setType(account.type);
                setParentId(account.parentId);
                setPlaceholder(account.placeholder);
                setIsEditing(true);

                const ob = getOpeningBalance(accountId);
                if (ob) {
                    setOpeningBalance(ob.amount);
                    setOpeningBalanceDate(ob.date);
                }
            }
        }
    }, [accountId, findAccount, getOpeningBalance]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const accountData = { name, description, type, parentId, placeholder };
        
        const obAmount = typeof openingBalance === 'number' ? openingBalance : parseFloat(String(openingBalance));
        const openingBalanceData = !placeholder && !isNaN(obAmount)
            ? { amount: obAmount, date: openingBalanceDate } 
            : undefined;

        if (isEditing && accountId) {
            updateAccount({ id: accountId, ...accountData }, openingBalanceData);
        } else {
            addAccount(accountData, openingBalanceData);
        }
        navigate('/accounts');
    };

    const parentAccountOptions = accounts.filter(a => a.placeholder);
    const rootAccounts = accounts.filter(a => a.parentId === null);

    return (
        <Card title={isEditing ? 'Edit Account' : 'New Account'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Account Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as AccountType)}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent Account</label>
                        <select id="parentId" value={parentId || ''} onChange={e => setParentId(e.target.value || null)}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">None (Root Account)</option>
                            {rootAccounts.map(acc => <option key={acc.id} value={acc.id} disabled>{acc.name}</option>)}
                            {parentAccountOptions.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="placeholder" name="placeholder" type="checkbox" checked={placeholder} onChange={e => setPlaceholder(e.target.checked)}
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="placeholder" className="font-medium text-gray-700">Placeholder Account</label>
                        <p className="text-gray-500">Placeholder accounts cannot have transactions. They are used for grouping other accounts.</p>
                    </div>
                </div>

                {!placeholder && (
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Opening Balance</h3>
                        <p className="mt-1 text-sm text-gray-500">Optional. Use this to set the starting balance when migrating from another system.</p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700">Balance Amount</label>
                                <input type="number" step="0.01" id="openingBalance" value={openingBalance} onChange={e => setOpeningBalance(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                <p className="mt-2 text-xs text-gray-500">For liabilities like loans or credit cards, enter a positive number (e.g., 50000).</p>
                            </div>
                            <div>
                                <label htmlFor="openingBalanceDate" className="block text-sm font-medium text-gray-700">Balance as of Date</label>
                                <input type="date" id="openingBalanceDate" value={openingBalanceDate} onChange={e => setOpeningBalanceDate(e.target.value)} required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => navigate(-1)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none">
                        {isEditing ? 'Save Changes' : 'Create Account'}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default AccountForm;