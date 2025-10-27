import { Account, Transaction, Budgets } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<{ status: string; database: string }> {
    return this.request('/health');
  }

  // Accounts operations
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>('/accounts');
  }

  async saveAccounts(accounts: Account[]): Promise<void> {
    await this.request('/accounts/bulk', {
      method: 'POST',
      body: JSON.stringify({ accounts }),
    });
  }

  async addAccount(account: Account): Promise<Account> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  async updateAccount(account: Account): Promise<Account> {
    return this.request<Account>(`/accounts/${account.id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.request(`/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // Transactions operations
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/transactions');
  }

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await this.request('/transactions/bulk', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${transaction.id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await this.request(`/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  // Budgets operations
  async getBudgets(): Promise<Budgets> {
    return this.request<Budgets>('/budgets');
  }

  async saveBudgets(budgets: Budgets): Promise<void> {
    await this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify({ budgets }),
    });
  }

  // Health check for connection status
  async isConnected(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'connected';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
