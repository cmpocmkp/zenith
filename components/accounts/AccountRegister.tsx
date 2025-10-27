import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { AccountType, Transaction, Split } from '../../types';
import Card from '../ui/Card';
import { formatRegisterAmount, formatAccountBalance } from '../../utils/formatters';

const AccountRegister: React.FC = () => {
    const { accountId } = useParams<{ accountId: string }>();
    const { getTransactionsForAccount, findAccount, accounts, getAccountBalance } = useData();

    const account = accountId ? findAccount(accountId) : undefined;
    const transactions = accountId ? getTransactionsForAccount(accountId) : [];
    const balance = accountId ? getAccountBalance(accountId) : 0;

    const isDebitNormal = account && [AccountType.ASSET, AccountType.EXPENSE].includes(account.type);

    const registerData = useMemo(() => {
        let runningBalance = 0;
        const reversedTxns = [...transactions].reverse(); // Oldest first
        
        // Calculate starting balance
        const totalBalance = balance;
        const balanceFromTheseTxns = reversedTxns.reduce((sum, txn) => {
             const split = txn.splits.find(s => s.accountId === accountId) as Split;
             return sum + split.amount;
        }, 0);
        
        let currentBalance = totalBalance - balanceFromTheseTxns;


        return reversedTxns.map(txn => {
            const split = txn.splits.find(s => s.accountId === accountId) as Split;
            const otherSplit = txn.splits.find(s => s.accountId !== accountId);
            const otherAccount = otherSplit ? findAccount(otherSplit.accountId) : null;
            
            const change = split.amount;
            const debit = change > 0 ? change : 0;
            const credit = change < 0 ? -change : 0;

            currentBalance += change;

            return {
                ...txn,
                debit,
                credit,
                balance: currentBalance,
                otherAccountName: otherAccount ? otherAccount.name : "Multiple accounts",
            };
        }).reverse(); // Newest first for display
    }, [transactions, accountId, findAccount, balance]);

    if (!account) {
        return <Card title="Error"><p>Account not found.</p></Card>;
    }
    
    return (
        <Card title={`Register: ${account.name}`}>
             <div className="flex justify-between items-center mb-4">
                <Link to={`/transactions/new?from_account=${account.id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Add New Transaction
                </Link>
                <div>
                  <span className="text-lg font-semibold text-gray-700">Current Balance: </span>
                  <span className="text-lg font-mono font-bold text-primary">{formatAccountBalance(balance, account.type)}</span>
                </div>
             </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Account</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isDebitNormal ? 'Increase' : 'Decrease'}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{isDebitNormal ? 'Decrease' : 'Increase'}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border-color">
                        {registerData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.otherAccountName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">{item.debit > 0 ? formatRegisterAmount(item.debit) : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">{item.credit > 0 ? formatRegisterAmount(item.credit) : ''}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${item.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{formatRegisterAmount(item.balance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions in this account.</p>}
            </div>
        </Card>
    );
};

export default AccountRegister;