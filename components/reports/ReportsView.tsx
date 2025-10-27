import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Account, AccountType, Transaction } from '../../types';
import Card from '../ui/Card';
import { formatCurrency, formatAccountBalance } from '../../utils/formatters';

type ReportType = 'p-and-l' | 'balance-sheet' | 'budget-vs-actuals' | 'chart-of-accounts';

const getFiscalYear = (date: Date) => {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
};

const getFiscalYearStart = (year: number) => {
    return new Date(year, 6, 1);
};

const getFiscalYearEnd = (year: number) => {
    return new Date(year + 1, 5, 30);
};

// --- Sub-components for each report ---

const ProfitAndLossStatement: React.FC = () => {
    const { transactions, findAccount } = useData();
    const [startDate, setStartDate] = useState(getFiscalYearStart(getFiscalYear(new Date())).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const reportData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const relevantTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });

        const accountTotals: Record<string, number> = {};
        
        relevantTransactions.forEach(txn => {
            txn.splits.forEach(split => {
                accountTotals[split.accountId] = (accountTotals[split.accountId] || 0) + split.amount;
            });
        });

        const incomeAccounts = Object.entries(accountTotals).map(([id, total]) => ({account: findAccount(id), total}))
            .filter(item => item.account && item.account.type === AccountType.INCOME).map(item => ({...item.account!, total: -item.total}));
        
        const expenseAccounts = Object.entries(accountTotals).map(([id, total]) => ({account: findAccount(id), total}))
            .filter(item => item.account && item.account.type === AccountType.EXPENSE).map(item => ({...item.account!, total: item.total}));

        const totalIncome = incomeAccounts.reduce((sum, acc) => sum + acc.total, 0);
        const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.total, 0);

        return { incomeAccounts, expenseAccounts, totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses };

    }, [startDate, endDate, transactions, findAccount]);

    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200"><h4 className="font-medium text-green-800">Total Income</h4><p className="text-2xl font-semibold text-green-700">{formatCurrency(reportData.totalIncome)}</p></div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200"><h4 className="font-medium text-red-800">Total Expenses</h4><p className="text-2xl font-semibold text-red-700">{formatCurrency(reportData.totalExpenses)}</p></div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200"><h4 className="font-medium text-blue-800">Net Profit / Loss</h4><p className={`text-2xl font-semibold ${reportData.netIncome >=0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(reportData.netIncome)}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Income</h3>
                    <div className="overflow-hidden border border-border-color rounded-lg"><table className="min-w-full divide-y divide-border-color"><tbody className="bg-white divide-y divide-border-color">{reportData.incomeAccounts.map(a => <tr key={a.id}><td className="px-4 py-2">{a.name}</td><td className="px-4 py-2 text-right font-mono">{formatCurrency(a.total)}</td></tr>)}</tbody></table></div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Expenses</h3>
                    <div className="overflow-hidden border border-border-color rounded-lg"><table className="min-w-full divide-y divide-border-color"><tbody className="bg-white divide-y divide-border-color">{reportData.expenseAccounts.map(a => <tr key={a.id}><td className="px-4 py-2">{a.name}</td><td className="px-4 py-2 text-right font-mono">{formatCurrency(a.total)}</td></tr>)}</tbody></table></div>
                </div>
            </div>
        </div>
    );
};

const BalanceSheet: React.FC = () => {
    const { getAccountHierarchy, getAccountBalance } = useData();
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    const AccountTree: React.FC<{ accounts: any[], date: string }> = ({ accounts, date }) => (
         <React.Fragment>
            {accounts.map(({ account, children, depth }) => {
                const balance = getAccountBalance(account.id, date);
                if (Math.abs(balance) < 0.01 && children.length === 0 && !account.placeholder) return null;
                return (
                <React.Fragment key={account.id}>
                    <tr className={account.placeholder ? 'bg-gray-50' : ''}>
                        <td className="py-2" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}><span className={account.placeholder ? 'font-bold' : ''}>{account.name}</span></td>
                        <td className="py-2 pr-4 text-right font-mono">{formatAccountBalance(balance, account.type)}</td>
                    </tr>
                    {children.length > 0 && <AccountTree accounts={children} date={date} />}
                </React.Fragment>
            )})}
        </React.Fragment>
    );

    const accountTree = getAccountHierarchy(null);
    const assetRoot = accountTree.find(n => n.account.type === AccountType.ASSET);
    const liabilityRoot = accountTree.find(n => n.account.type === AccountType.LIABILITY);
    const equityRoot = accountTree.find(n => n.account.type === AccountType.EQUITY);

    const totalAssets = assetRoot ? getAccountBalance(assetRoot.account.id, asOfDate) : 0;
    const totalLiabilities = liabilityRoot ? getAccountBalance(liabilityRoot.account.id, asOfDate) : 0;
    const totalEquity = equityRoot ? getAccountBalance(equityRoot.account.id, asOfDate) : 0;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <div className="space-y-4">
             <div>
                <label htmlFor="as-of-date" className="block text-sm font-medium text-gray-700">As of Date</label>
                <input type="date" id="as-of-date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)}
                    className="mt-1 block w-full max-w-xs px-3 py-2 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Assets</h3>
                     <div className="overflow-hidden border border-border-color rounded-lg"><table className="min-w-full"><tbody className="bg-white">{assetRoot && <AccountTree accounts={assetRoot.children} date={asOfDate} />}</tbody><tfoot><tr className="bg-gray-100 font-bold border-t-2 border-gray-300"><td className="p-2 pl-4">Total Assets</td><td className="p-2 pr-4 text-right font-mono">{formatCurrency(totalAssets)}</td></tr></tfoot></table></div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Liabilities & Equity</h3>
                     <div className="overflow-hidden border border-border-color rounded-lg"><table className="min-w-full"><tbody className="bg-white">{liabilityRoot && <AccountTree accounts={liabilityRoot.children} date={asOfDate} />}{equityRoot && <AccountTree accounts={equityRoot.children} date={asOfDate} />}</tbody><tfoot><tr className="bg-gray-100 font-bold border-t-2 border-gray-300"><td className="p-2 pl-4">Total Liabilities & Equity</td><td className="p-2 pr-4 text-right font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</td></tr></tfoot></table></div>
                </div>
            </div>
        </div>
    );
};

const BudgetVsActuals: React.FC = () => {
    const { accounts, budgets, getAccountBalance } = useData();
    const [fiscalYear, setFiscalYear] = useState(getFiscalYear(new Date()));

    const reportData = useMemo(() => {
        const relevantAccounts = accounts.filter(a => !a.placeholder && (a.type === AccountType.INCOME || a.type === AccountType.EXPENSE));
        const startDate = getFiscalYearStart(fiscalYear).toISOString();
        const endDate = getFiscalYearEnd(fiscalYear).toISOString();
        
        return relevantAccounts.map(acc => {
            const budgetKey = `${fiscalYear}-${acc.id}`;
            const budget = budgets[budgetKey] || 0;
            const balance = getAccountBalance(acc.id, endDate) - getAccountBalance(acc.id, new Date(getFiscalYearStart(fiscalYear).getTime() - 1).toISOString());
            const actual = acc.type === AccountType.INCOME ? -balance : balance;
            const variance = budget - actual;
            return { ...acc, budget, actual, variance };
        });
    }, [fiscalYear, accounts, budgets, getAccountBalance]);

    const years = [new Date().getFullYear() + 1, new Date().getFullYear(), new Date().getFullYear() - 1];

    return (
        <div className="space-y-4">
             <div>
                <label htmlFor="fiscal-year" className="block text-sm font-medium text-gray-700">Fiscal Year</label>
                <select id="fiscal-year" value={fiscalYear} onChange={e => setFiscalYear(parseInt(e.target.value))} className="mt-1 block max-w-xs w-full pl-3 pr-10 py-2 text-base border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                   {years.map(y => <option key={y} value={y}>{y} - {y+1}</option>)}
                </select>
            </div>
            <div className="overflow-hidden border border-border-color rounded-lg">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-4 py-2 text-left">Account</th>
                        <th className="px-4 py-2 text-right">Budget</th>
                        <th className="px-4 py-2 text-right">Actual</th>
                        <th className="px-4 py-2 text-right">Variance</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-border-color">
                        {reportData.map(d => <tr key={d.id}>
                            <td className="px-4 py-2">{d.name}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(d.budget)}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(d.actual)}</td>
                            <td className={`px-4 py-2 text-right font-mono ${d.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(d.variance)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const ChartOfAccountsListing: React.FC = () => {
    const { getAccountHierarchy, getAccountBalance } = useData();
    const accountTree = getAccountHierarchy(null);

    const AccountRow: React.FC<{ account: Account; depth: number }> = ({ account, depth }) => {
        const balance = getAccountBalance(account.id);
        const indentStyle = { paddingLeft: `${depth * 1.5 + 1}rem` };
        return (
            <tr className={account.placeholder ? 'bg-gray-50' : ''}>
                <td className="py-2" style={indentStyle}>
                    <span className={account.placeholder ? 'font-bold' : ''}>{account.name}</span>
                </td>
                <td className="py-2 px-4">{account.type}</td>
                <td className="py-2 px-4 text-sm text-gray-500">{account.description}</td>
                <td className="py-2 px-4 text-right font-mono">
                    {!account.placeholder && formatAccountBalance(balance, account.type)}
                </td>
            </tr>
        );
    };

    const AccountTreeComponent: React.FC<{ accounts: { account: Account; children: any[]; depth: number }[] }> = ({ accounts }) => (
        <>
            {accounts.map(({ account, children, depth }) => (
                <React.Fragment key={account.id}>
                    <AccountRow account={account} depth={depth} />
                    {children.length > 0 && <AccountTreeComponent accounts={children} />}
                </React.Fragment>
            ))}
        </>
    );

    return (
        <div>
            <div className="overflow-hidden border border-border-color rounded-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-border-color">
                        <tr>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {accountTree.map(({ account, children }) => (
                            <React.Fragment key={account.id}>
                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                    <td colSpan={4} className="p-2 pl-4">{account.name}</td>
                                </tr>
                                <AccountTreeComponent accounts={children} />
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main View Component ---

const ReportsView: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType>('p-and-l');

    const renderActiveReport = () => {
        switch (activeReport) {
            case 'p-and-l': return <ProfitAndLossStatement />;
            case 'balance-sheet': return <BalanceSheet />;
            case 'budget-vs-actuals': return <BudgetVsActuals />;
            case 'chart-of-accounts': return <ChartOfAccountsListing />;
            default: return null;
        }
    };
    
    const TabButton: React.FC<{reportType: ReportType, label: string}> = ({reportType, label}) => (
        <button type="button" onClick={() => setActiveReport(reportType)} 
            className={`${activeReport === reportType ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {label}
        </button>
    );

    return (
        <Card>
            <div className="border-b border-border-color -mt-6 -mx-6 mb-6">
                <nav className="flex space-x-4 px-6" aria-label="Tabs">
                    <TabButton reportType="p-and-l" label="Profit & Loss Statement" />
                    <TabButton reportType="balance-sheet" label="Balance Sheet" />
                    <TabButton reportType="budget-vs-actuals" label="Budget vs. Actuals" />
                    <TabButton reportType="chart-of-accounts" label="Chart of Accounts" />
                </nav>
            </div>
            {renderActiveReport()}
        </Card>
    );
};

export default ReportsView;