import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB configuration
const MONGODB_URI = 'mongodb://mongo:zTCtVuAqZoZLEhRogJKERDUaxodKCTKj@switchyard.proxy.rlwy.net:50611';
const DB_NAME = 'zenith-ledger';

let client;
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.admin().ping();
    res.json({ status: 'connected', database: 'MongoDB' });
  } catch (error) {
    res.status(500).json({ status: 'disconnected', error: error.message });
  }
});

// Accounts endpoints
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await db.collection('accounts').find({}).toArray();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const result = await db.collection('accounts').insertOne(req.body);
    res.json({ ...req.body, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('accounts').replaceOne({ id }, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('accounts').deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.collection('transactions').find({}).toArray();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const result = await db.collection('transactions').insertOne(req.body);
    res.json({ ...req.body, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('transactions').replaceOne({ id }, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('transactions').deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations for data sync
app.post('/api/accounts/bulk', async (req, res) => {
  try {
    const { accounts } = req.body;
    await db.collection('accounts').deleteMany({});
    if (accounts.length > 0) {
      await db.collection('accounts').insertMany(accounts);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions/bulk', async (req, res) => {
  try {
    const { transactions } = req.body;
    await db.collection('transactions').deleteMany({});
    if (transactions.length > 0) {
      await db.collection('transactions').insertMany(transactions);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budgets endpoints
app.get('/api/budgets', async (req, res) => {
  try {
    const result = await db.collection('budgets').findOne({ _id: 'main' });
    res.json(result?.data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { budgets } = req.body;
    await db.collection('budgets').replaceOne(
      { _id: 'main' },
      { _id: 'main', data: budgets },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.use((req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
async function startServer() {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
