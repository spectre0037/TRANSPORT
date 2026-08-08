import { Router } from 'express';
import { db } from '../db/index.js';
import { notifications, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';

const router = Router();

// GET all notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const allNotifications = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    res.json(allNotifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create notification (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        title,
        message,
        createdBy: req.user.id,
      })
      .returning();

    res.status(201).json(notification);
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST send notification email to all students (admin only)
router.post('/:id/send-email', authenticate, requireAdmin, async (req, res) => {
  try {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, req.params.id));

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.sentViaEmail) {
      return res.status(400).json({ error: 'Email already sent for this notification' });
    }

    // Get all students
    const students = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, 'student'));

    let recipientCount = 0;
    for (const student of students) {
      try {
        await sendEmail({
          to: student.email,
          ...emailTemplates.notificationAnnouncement(notification.title, notification.message),
        });
        recipientCount++;
      } catch (emailErr) {
        console.error(`Failed to email ${student.email}:`, emailErr.message);
      }
    }

    // Mark as sent
    await db
      .update(notifications)
      .set({ sentViaEmail: true })
      .where(eq(notifications.id, req.params.id));

    res.json({ message: `Notification emailed to ${recipientCount} students`, recipientCount });
  } catch (err) {
    console.error('Send notification email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE notification (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.delete(notifications).where(eq(notifications.id, req.params.id));
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
