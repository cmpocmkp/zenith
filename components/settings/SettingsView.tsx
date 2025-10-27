import React, { useState, useCallback } from 'react';
import { useData } from '../../hooks/useData';
import Card from '../ui/Card';
import { Account, Transaction } from '../../types';

const SettingsView: React.FC = () => {
    const { accounts, transactions, budgets, setAccounts, setTransactions, setBudgets } = useData();
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);

    const handleExport = useCallback(() => {
        const dataToExport = {
            accounts,
            transactions,
            budgets,
            exportedAt: new Date().toISOString(),
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mya-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [accounts, transactions, budgets]);
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImportError(null);
        setImportSuccess(null);
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File is not readable.");
                }
                const data = JSON.parse(text);

                // Basic validation
                if (!data.accounts || !Array.isArray(data.accounts) || !data.transactions || !Array.isArray(data.transactions) || typeof data.budgets !== 'object') {
                   throw new Error("Invalid file format. The file must contain accounts, transactions, and budgets.");
                }

                if (window.confirm("Are you sure you want to import this data? This will overwrite all current data in the application.")) {
                    setAccounts(data.accounts as Account[]);
                    setTransactions(data.transactions as Transaction[]);
                    setBudgets(data.budgets as Record<string, number>);
                    setImportSuccess("Data imported successfully! The application will now reload.");
                    
                    // Reload to ensure the entire application state is refreshed
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                console.error("Import failed:", error);
                setImportError(error instanceof Error ? error.message : "An unknown error occurred during import.");
            } finally {
                // Reset file input so the same file can be selected again
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="space-y-6">
            <Card title="Data Management">
                <div className="space-y-8">
                    {/* Export Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Download a complete backup of your ledger. This file (in JSON format) contains all your accounts, transactions, and budgets. Keep it in a safe place.
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Export Data
                            </button>
                        </div>
                    </div>
                     {/* Import Section */}
                    <div className="border-t border-border-color pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Restore your ledger from a previously exported backup file.
                        </p>
                         <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <span className="font-bold">Warning:</span> Importing data will completely overwrite all existing accounts, transactions, and budgets in the application.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                             <input
                                type="file"
                                id="import-file"
                                className="hidden"
                                accept=".json,application/json"
                                onChange={handleImport}
                            />
                            <label
                                htmlFor="import-file"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Choose Backup File...
                            </label>
                        </div>
                         {importError && (
                            <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">{importError}</p>
                        )}
                        {importSuccess && (
                            <p className="mt-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">{importSuccess}</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsView;