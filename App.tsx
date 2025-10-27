import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import Login from './components/auth/Login';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AccountsView from './components/accounts/AccountsView';
import AccountRegister from './components/accounts/AccountRegister';
import TransactionForm from './components/transactions/TransactionForm';
import AccountForm from './components/accounts/AccountForm';
import ReportsView from './components/reports/ReportsView';
import BudgetView from './components/budget/BudgetView';
import SettingsView from './components/settings/SettingsView';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-background text-text-main">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/accounts" element={<AccountsView />} />
                <Route path="/accounts/new" element={<AccountForm />} />
                <Route path="/accounts/:accountId" element={<AccountRegister />} />
                <Route path="/accounts/:accountId/edit" element={<AccountForm />} />
                <Route path="/transactions/new" element={<TransactionForm />} />
                <Route path="/reports" element={<ReportsView />} />
                <Route path="/budget" element={<BudgetView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;