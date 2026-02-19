// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  recipientRole: { type: String, enum: ["POLICE", "SUPERIOR_POLICE", "JUDICIARY"], required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "Police" }, // optional for role
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
