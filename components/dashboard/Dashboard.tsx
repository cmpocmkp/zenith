import React, { useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { AccountType } from '../../types';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import DatabaseStatus from '../DatabaseStatus';

const StatCard: React.FC<{title: string, value: number, colorClass?: string}> = ({title, value, colorClass = 'text-text-main'}) => (
    <Card>
        <h4 className="text-text-light text-sm font-medium">{title}</h4>
        <p className={`mt-1 text-3xl font-semibold ${colorClass}`}>{formatCurrency(value)}</p>
    </Card>
);

const IncomeExpensePieChart: React.FC<{income: number, expenses: number}> = ({income, expenses}) => {
    const total = income + expenses;
    if (total === 0) {
        return <div className="flex items-center justify-center h-full text-text-light text-sm">No data to display.</div>;
    }
    const incomePercent = (income / total) * 100;
    
    // Using CSS conic-gradient for a clean, dependency-free pie chart
    const conicGradient = `conic-gradient(#10b981 ${incomePercent}%, #ef4444 0)`;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div 
                className="w-24 h-24 rounded-full" 
                style={{ background: conicGradient }}
                role="img"
                aria-label={`Pie chart showing ${incomePercent.toFixed(1)}% income and ${(100-incomePercent).toFixed(1)}% expenses.`}
            ></div>
            <div className="flex flex-col text-sm w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                       <span className="w-3 h-3 rounded-full bg-secondary mr-2"></span>
                       <span>Income</span>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(income)}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span>Expenses</span>
                    </div>
                    <span className="font-medium text-red-600">{formatCurrency(expenses)}</span>
                </div>
            </div>
        </div>
    );
};

const MonthlyTrendChart: React.FC<{data: {name: string, income: number, expenses: number}[]}> = ({data}) => {
    const maxValue = Math.max(1, ...data.flatMap(d => [d.income, d.expenses]));
    if (maxValue <= 1) {
        return <div className="flex items-center justify-center h-full text-text-light">Not enough data for a monthly trend.</div>;
    }

    return (
        <div className="h-64 flex items-end justify-around pt-4 space-x-2">
            {data.map(month => (
                <div key={month.name} className="flex-1 flex flex-col items-center h-full" title={month.name}>
                    <div className="flex items-end h-full w-full justify-center space-x-1">
                        <div 
                            className="w-1/2 bg-secondary rounded-t-sm"
                            style={{ height: `${(month.income / maxValue) * 100}%` }}
                            title={`Income: ${formatCurrency(month.income)}`}
                        ></div>
                        <div 
                            className="w-1/2 bg-red-500 rounded-t-sm"
                            style={{ height: `${(month.expenses / maxValue) * 100}%` }}
                            title={`Expenses: ${formatCurrency(month.expenses)}`}
                        ></div>
                    </div>
                    <span className="text-xs text-text-light mt-2">{month.name}</span>
                </div>
            ))}
        </div>
    );
}


const Dashboard: React.FC = () => {
  const { accounts, transactions, getAccountBalance } = useData();

  const dashboardData = useMemo(() => {
    // 1. All-time metrics (for cards & pie chart)
    const assetRoot = accounts.find(a => a.name === 'Assets' && a.parentId === null);
    const liabilityRoot = accounts.find(a => a.name === 'Liabilities' && a.parentId === null);

    const totalAssets = assetRoot ? getAccountBalance(assetRoot.id) : 0;
    const totalLiabilities = liabilityRoot ? getAccountBalance(liabilityRoot.id) : 0; // This is a negative number
    const netWorth = totalAssets + totalLiabilities;

    let totalIncome = 0;
    let totalExpenses = 0;
    const monthlyTotals: { [key: string]: { income: number, expenses: number } } = {};

    transactions.forEach(txn => {
      // Aggregate total income/expenses
      txn.splits.forEach(split => {
        const account = accounts.find(a => a.id === split.accountId);
        if (account) {
          if (account.type === AccountType.INCOME) {
            totalIncome -= split.amount; // income is credit (-), so negate for positive value
          }
          if (account.type === AccountType.EXPENSE) {
            totalExpenses += split.amount; // expense is debit (+), so sum directly
          }
        }
      });

      // Aggregate monthly income/expenses
      const date = new Date(txn.date);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTotals[yearMonth]) {
        monthlyTotals[yearMonth] = { income: 0, expenses: 0 };
      }
      txn.splits.forEach(split => {
        const account = accounts.find(a => a.id === split.accountId);
        if (account) {
          if (account.type === AccountType.INCOME) {
            monthlyTotals[yearMonth].income -= split.amount;
          }
          if (account.type === AccountType.EXPENSE) {
            monthlyTotals[yearMonth].expenses += split.amount;
          }
        }
      });
    });

    // 2. Prepare data for monthly trend chart (last 12 months)
    const monthlyTrendData = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        monthlyTrendData.push({
            name: `${monthName} '${String(year).slice(-2)}`,
            income: monthlyTotals[yearMonth]?.income || 0,
            expenses: monthlyTotals[yearMonth]?.expenses || 0,
        });
    }

    return { netWorth, totalAssets, totalLiabilities, totalIncome, totalExpenses, monthlyTrendData };
  }, [accounts, transactions, getAccountBalance]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);


  return (
    <div className="space-y-6">
      <DatabaseStatus />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Net Worth" value={dashboardData.netWorth} />
        <StatCard title="Total Assets" value={dashboardData.totalAssets} colorClass="text-green-600" />
        <StatCard title="Total Liabilities" value={Math.abs(dashboardData.totalLiabilities)} colorClass="text-red-600" />
        <Card title="Revenue Breakdown">
          <IncomeExpensePieChart income={dashboardData.totalIncome} expenses={dashboardData.totalExpenses} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <Card title="Monthly Financial Trend (Last 12 Months)">
                <MonthlyTrendChart data={dashboardData.monthlyTrendData} />
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="Recent Transactions">
                <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {recentTransactions.length > 0 ? recentTransactions.map((transaction, transactionIdx) => (
                    <li key={transaction.id}>
                        <div className="relative pb-8">
                        {transactionIdx !== recentTransactions.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                            <div>
                            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M7 7l10 10" /></svg>
                            </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                                <p className="text-sm text-gray-800">{transaction.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={transaction.date}>{new Date(transaction.date).toLocaleDateString()}</time>
                            </div>
                            </div>
                        </div>
                        </div>
                    </li>
                    )) : <p className="text-text-light">No transactions yet.</p>}
                </ul>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;