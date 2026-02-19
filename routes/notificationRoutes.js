const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, markRead } = require('../controllers/notification');
const Notification = require("../models/Notification");

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.patch('/:id/read', protect, markRead);

// Optional: Inline version to fetch unread notifications
router.get("/my", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
      isRead: false
    }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
