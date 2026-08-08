import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getWalletBalance, getTransactions } from '../services/wallet.service.js';

const router = Router();

// Get wallet balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const balance = await getWalletBalance(req.user.id);
    res.json({ balance });
  } catch (err) {
    console.error('Get balance error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await getTransactions(req.user.id);
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
