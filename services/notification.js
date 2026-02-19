// services/notification.service.js
const Case = require("../models/Case");
const Police = require("../models/Police");
const Notification = require("../models/Notification");

async function notifyHighPriorityCases() {
  const now = new Date();

  // Get all pending cases
  const pendingCases = await Case.find({
    status: "PENDING",
    severity_label: { $in: ["HIGH", "CRITICAL"] }
  });

  for (const c of pendingCases) {
    // Calculate SLA breach
    const assignedTime = c.assignedAt || c.createdAt;
    const slaHours = c.severity_label === "CRITICAL" ? 6 : 12;
    const slaDeadline = new Date(assignedTime);
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    if (now > slaDeadline) {
      // Notify primary police
      if (c.assignedPolice) {
        await Notification.create({
          caseId: c._id,
          recipientRole: "POLICE",
          recipientId: c.assignedPolice,
          message: `⏰ Case ${c.caseNumber} is HIGH priority and pending beyond SLA.`
        });
      }

      // Notify superior police
      if (c.assignedSuperiorPolice) {
        await Notification.create({
          caseId: c._id,
          recipientRole: "SUPERIOR_POLICE",
          recipientId: c.assignedSuperiorPolice,
          message: `⚠️ Case ${c.caseNumber} is unattended. Take action immediately.`
        });
      }

      // Notify judiciary if still unattended
      if (!c.resolvedByPolice) {
        await Notification.create({
          caseId: c._id,
          recipientRole: "JUDICIARY",
          message: `🚨 Case ${c.caseNumber} requires urgent judicial attention.`
        });
      }
    }
  }
}

module.exports = { notifyHighPriorityCases };
