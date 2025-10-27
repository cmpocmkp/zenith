import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import { Account, AccountType } from '../../types';
import Card from '../ui/Card';
import { formatAccountBalance } from '../../utils/formatters';

const AccountRow: React.FC<{ account: Account; depth: number; balance: number }> = ({ account, depth, balance }) => {
  const indentStyle = { paddingLeft: `${depth * 1.5}rem` };
  
  const content = (
    <div className={`flex justify-between items-center py-3 px-4 ${account.placeholder ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
      <div className="flex items-center">
        <span style={indentStyle}>{account.name}</span>
        <Link to={`/accounts/${account.id}/edit`} className="ml-4 text-xs text-primary hover:underline opacity-50 hover:opacity-100 transition-opacity">
            Edit
        </Link>
      </div>
      {!account.placeholder && (
        <span className={`font-mono text-sm`}>
          {formatAccountBalance(balance, account.type)}
        </span>
      )}
    </div>
  );

  if (account.placeholder) {
    return <div className="bg-gray-50 border-t border-b border-gray-200 -mx-6 px-6">{content}</div>;
  }

  return (
    <Link to={`/accounts/${account.id}`} className="block hover:bg-gray-50 transition-colors duration-150">
      {content}
    </Link>
  );
};


const AccountTree: React.FC<{ accounts: { account: Account; children: any[]; depth: number }[] }> = ({ accounts }) => {
  const { getAccountBalance } = useData();
  
  return (
    <div>
      {accounts.map(({ account, children, depth }) => (
        <React.Fragment key={account.id}>
          <AccountRow account={account} depth={depth} balance={getAccountBalance(account.id)} />
          {children.length > 0 && <AccountTree accounts={children} />}
        </React.Fragment>
      ))}
    </div>
  );
};


const AccountsView: React.FC = () => {
  const { getAccountHierarchy } = useData();
  const accountTree = getAccountHierarchy(null);

  const renderTreeForType = (type: AccountType) => {
    const rootAccount = accountTree.find(node => node.account.type === type);
    if (!rootAccount) return null;
    return (
       <Card title={rootAccount.account.name} className="overflow-hidden">
        <div className="-m-6">
          <AccountTree accounts={rootAccount.children} />
        </div>
      </Card>
    )
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link to="/accounts/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          New Account
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderTreeForType(AccountType.ASSET)}
          {renderTreeForType(AccountType.LIABILITY)}
          {renderTreeForType(AccountType.EQUITY)}
        </div>
        <div className="space-y-6">
          {renderTreeForType(AccountType.INCOME)}
          {renderTreeForType(AccountType.EXPENSE)}
        </div>
      </div>
    </div>
  );
};

export default AccountsView;