const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const { _id } = req.user;
        const notifications = await Notification.find({ receiverId: _id }).sort({ createdAt: -1 });
        res.json({ notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
