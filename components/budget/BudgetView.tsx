import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Account, AccountType } from '../../types';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

const getFiscalYear = (date: Date) => {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
};

const BudgetItem: React.FC<{account: Account, fiscalYear: number}> = ({ account, fiscalYear }) => {
    const { budgets, setBudget } = useData();
    const budgetKey = `${fiscalYear}-${account.id}`;
    const [amount, setAmount] = useState(budgets[budgetKey] || '');

    const handleBlur = () => {
        const numericAmount = parseFloat(String(amount));
        if (!isNaN(numericAmount)) {
            setBudget(fiscalYear, account.id, numericAmount);
        } else {
            setBudget(fiscalYear, account.id, 0);
            setAmount('');
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <span className="text-gray-500 sm:text-sm">PKR</span>
                    </div>
                    <input
                        type="number"
                        step="1000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={handleBlur}
                        className="focus:ring-primary focus:border-primary block w-full pl-12 pr-4 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                    />
                </div>
            </td>
        </tr>
    )
}

const BudgetView: React.FC = () => {
    const { accounts } = useData();
    const [fiscalYear, setFiscalYear] = useState(getFiscalYear(new Date()));

    const budgetAccounts = useMemo(() => {
        return accounts.filter(a => !a.placeholder && (a.type === AccountType.INCOME || a.type === AccountType.EXPENSE));
    }, [accounts]);
    
    const years = [new Date().getFullYear() + 1, new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4 -mt-2">
                <h2 className="text-xl font-semibold text-gray-800">Set Annual Budget</h2>
                <div>
                     <label htmlFor="fiscal-year" className="block text-sm font-medium text-gray-700 sr-only">Fiscal Year</label>
                     <select id="fiscal-year" value={fiscalYear} onChange={e => setFiscalYear(parseInt(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {years.map(y => <option key={y} value={y}>Fiscal Year {y} - {y+1}</option>)}
                     </select>
                </div>
            </div>
             <div className="overflow-x-auto">
                <div className="align-middle inline-block min-w-full">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {budgetAccounts.map(account => (
                                    <BudgetItem key={account.id} account={account} fiscalYear={fiscalYear} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BudgetView;
