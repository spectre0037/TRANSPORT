import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Get unsigned upload config (no signature needed)
router.get('/signed-url', authenticate, async (req, res) => {
  try {
    res.json({
      url: `https://api.cloudinary.com/v1_1/dddqgvcic/image/upload`,
      cloudName: 'dddqgvcic',
      uploadPreset: 'taleemxpress_preset',
      folder: req.query.folder || 'taleemxpress',
    });
  } catch (err) {
    console.error('Get upload URL error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;