# Zenith Ledger - Online Accounting System

A modern, full-stack accounting application built with React, TypeScript, and MongoDB. This comprehensive accounting system provides double-entry bookkeeping, financial reporting, and AI-powered features.

## 🚀 Features

### Core Accounting

- **Chart of Accounts**: Hierarchical account structure with assets, liabilities, equity, income, and expenses
- **Double-Entry Bookkeeping**: Complete transaction recording with automatic balance validation
- **Account Management**: Create, edit, and organize accounts with opening balances
- **Transaction Recording**: Detailed transaction entry with multiple splits

### Financial Management

- **Real-time Dashboard**: Live financial overview with key metrics and charts
- **Financial Reports**: Balance sheet, income statement, and cash flow reports
- **Budget Tracking**: Set and monitor budgets for different accounts and periods
- **Monthly Trends**: Visual representation of income and expenses over time

### Advanced Features

- **AI Integration**: Smart transaction suggestions using Google Gemini API
- **Data Persistence**: MongoDB backend for reliable data storage
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Real-time Sync**: Automatic data synchronization between frontend and backend

## 🛠 Tech Stack

### Frontend

- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend

- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **CORS** - Cross-origin resource sharing

### AI & External Services

- **Google Gemini API** - AI-powered transaction suggestions
- **MongoDB Atlas** - Cloud database hosting

## 📦 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/cmpocmkp/zenith.git
   cd zenith
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://your_mongodb_connection_string
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start the development servers**:

   ```bash
   npm run dev:full
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🚀 Available Scripts

- `npm run dev` - Start frontend development server (port 3000)
- `npm run dev:server` - Start backend API server (port 3001)
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## 🏗 Project Structure

```
zenith-ledger/
├── components/           # React components
│   ├── accounts/        # Account management components
│   ├── auth/           # Authentication components
│   ├── budget/         # Budget tracking components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   ├── reports/        # Reporting components
│   ├── transactions/   # Transaction components
│   └── ui/            # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Utility functions
├── server.js           # Express.js backend server
├── App.tsx            # Main React application
└── package.json       # Dependencies and scripts
```

## 🔧 Configuration

### MongoDB Setup

The application uses MongoDB for data persistence. Update the connection string in `server.js`:

```javascript
const MONGODB_URI = "your_mongodb_connection_string";
```

### Gemini AI Setup

To enable AI features, add your Gemini API key to the environment variables:

```env
GEMINI_API_KEY=your_api_key_here
```

## 📊 Database Schema

### Collections

- **accounts**: Chart of accounts with hierarchical structure
- **transactions**: Double-entry transactions with splits
- **budgets**: Budget data organized by fiscal year and account

### Sample Account Structure

```
Assets
├── Current Assets
│   ├── Cash
│   ├── Bank Accounts
│   └── Accounts Receivable
└── Fixed Assets
    └── Equipment

Liabilities
├── Current Liabilities
│   └── Accounts Payable
└── Long-term Liabilities

Equity
├── Owner's Equity
└── Opening Balances

Income
└── Revenue

Expenses
├── Operating Expenses
└── Cost of Goods Sold
```

## 🌐 API Endpoints

### Accounts

- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `POST /api/accounts/bulk` - Bulk update accounts

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk` - Bulk update transactions

### Budgets

- `GET /api/budgets` - Get budget data
- `POST /api/budgets` - Update budget data

### Health

- `GET /api/health` - Check API and database status

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Gemini API key (optional)

### Production Build

1. Build the frontend and start the server (single command):

   ```bash
   npm run build:server
   ```

   Or build and start separately:

   ```bash
   npm run build
   npm start
   ```

2. The server will serve both the API and the React frontend on the same port

### Railway Deployment

For Railway deployment, the application automatically:

- Uses the `PORT` environment variable provided by Railway
- Serves the React frontend and API from the same port
- Automatically detects the production environment for API URL configuration

Set these environment variables in your Railway project:

- `MONGODB_URI` - Your MongoDB connection string
- `GEMINI_API_KEY` - For AI features (optional)

### Environment Variables

Set these environment variables in production:

- `GEMINI_API_KEY` - For AI features
- `MONGODB_URI` - Database connection string
- `PORT` - Backend server port (default: 3001)
- `VITE_API_BASE_URL` - Frontend API base URL (e.g., `https://your-backend-domain.com/api`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database solution
- Google for the Gemini AI API
- Tailwind CSS for the utility-first styling
- Vite for the fast build tooling

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Zenith Ledger** - Modern accounting made simple and powerful.
