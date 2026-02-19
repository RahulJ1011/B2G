const cron = require("node-cron");
const Case = require("../models/Case");
const notify = require("../utils/notify");

cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    const cases = await Case.find({
        "sla.deadline": { $lt: now },
        status: { $ne: "RESOLVED" }
    });

    for (const c of cases) {

        if (c.current_authority === "POLICE") {
            c.current_authority = "SUPERIOR";
            notify.user(c.reporter, "Police did not respond. Case escalated to senior officers.");
            notify.superior(c);

        } else if (c.current_authority === "SUPERIOR") {
            c.current_authority = "JUDICIARY";
            notify.user(c.reporter, "Case escalated to judiciary due to continued inaction.");
            notify.judiciary(c);

        } else {
            continue; // Judiciary level reached
        }

        // Reset SLA for next authority
        c.sla = {
            hours: 12,
            deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
            breached: false
        };

        c.status = "IN_PROGRESS";
        await c.save();
    }
});
