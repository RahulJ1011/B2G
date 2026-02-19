const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require("node-cron");
const Case = require("./models/Case");
const Notification = require("./models/Notification");
const Police = require("./models/Police");

const { notifyHighPriorityCases } = require("./services/notification")
require("./jobs/slaWatcher")
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();

  const overdueCases = await Case.find({
    status: { $ne: "RESOLVED" },
    "sla.deadline": { $lt: now }
  });

  for (let caseObj of overdueCases) {
    // If police failed
    if (caseObj.current_authority === "POLICE") {
      const superior = await Police.findOne({ role: "SUPERIOR", stationId: caseObj.assignedPoliceStation });
      if (superior) {
        caseObj.current_authority = "SUPERIOR";
        caseObj.escalationCount = (caseObj.escalationCount || 0) + 1;

        await Notification.create({
          recipientId: superior._id,
          caseId: caseObj._id,
          message: `Case SLA breached by assigned police. You are now responsible.`
        });
      }
    }
    // If superior failed
    else if (caseObj.current_authority === "SUPERIOR") {
      caseObj.current_authority = "JUDICIARY";
      caseObj.escalationCount = (caseObj.escalationCount || 0) + 1;

      await Notification.create({
        recipientRole: "JUDICIARY",
        caseId: caseObj._id,
        message: `Case SLA breached by superior police. Judiciary must review now.`
      });
    }

    caseObj.sla.breached = true;
    await caseObj.save();
  }
});



// Routes
app.use('/api', require('./routes/index'));
app.use('/api', require('./routes/authRoutes'))
app.use('/api', require('./routes/caseRoutes'))
app.use('/api', require('./routes/notificationRoutes'))
app.use('/api', require('./routes/stationRoutes'))

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
