const axios = require("axios");
const Case = require("../models/Case");
const Police = require("../models/Police");
const Notification = require("../models/Notification");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"; // your severity API

exports.submitCase = async (req, res) => {
    try {
        const { crime_type, location, description, incident_datetime } = req.body;

        const payload = {
            crime_type,
            location,
            description,
            reporter_name: req.user.name,
            incident_datetime
        };

        // 🔮 Call Severity API
        const severityRes = await axios.post(`${FASTAPI_URL}/predict`, payload);
        const sev = severityRes.data;

        // ⏰ SLA calculation
        let slaHours = 24;
        if (sev.severity_label === "CRITICAL") slaHours = 6;
        else if (sev.severity_label === "HIGH") slaHours = 12;

        const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        // Find available police at that location
        const assignedPolice = await Police.findOne({ location, role: "POLICE" });

        // Create case
        const newCase = await Case.create({
            reporter: req.user._id,
            reporter_name: req.user.name,
            crime_type,
            location,
            description,
            incident_datetime,

            severity: {
                label: sev.severity_label,
                score_estimate: sev.severity_score_estimate,
                confidence: sev.confidence,
                label_probabilities: sev.label_probabilities,
                model_used: sev.model_used,
                recommendation: sev.recommendation
            },

            sla: {
                hours: slaHours,
                deadline
            },

            assignedPolice: assignedPolice ? assignedPolice._id : null,
            current_authority: assignedPolice ? "POLICE" : "SUPERIOR" // fallback if no police available
        });

        // Notify assigned police
        if (assignedPolice) {
            await Notification.create({
                recipientId: assignedPolice._id,
                caseId: newCase._id,
                message: `New case assigned at ${location}. Severity: ${sev.severity_label}. Attend immediately.`
            });
        }

        res.status(201).json({ success: true, case: newCase });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// ------------------- Get Cases -------------------
exports.getCases = async (req, res) => {
    try {
        /* const { role, _id, stationId } = req.user; */
        let filter = {};

        /*  if (role === "CITIZEN") filter = { citizenId: _id };
         else if (role === "POLICE") filter = { assignedOfficer: _id };
         else if (role === "SUPERIOR") filter = { stationId }; */
        // Judiciary can see all cases by default

        const cases = await Case.find(filter).sort({ severityScore: -1, createdAt: 1 });
        res.json({ cases });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- Update Case (Police / Admin) -------------------


exports.updateCase = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the case by ID
        const caseObj = await Case.findById(id);
        console.log(id);
        if (!caseObj) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Simple update: just add a log entry that case was updated
        caseObj.logs.push({
            action: "Case updated",
            timestamp: new Date()
        });

        await caseObj.save();

        res.json({ message: "Case updated successfully", case: caseObj });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
// ------------------- Mutual Closure -------------------
exports.confirmResolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: actorId, role } = req.user;

        const caseObj = await Case.findById(id);
        if (!caseObj) return res.status(404).json({ message: "Case not found" });

        if (role === "CITIZEN") caseObj.citizenAgree = true;
        else if (role === "POLICE") caseObj.policeAgree = true;
        else return res.status(403).json({ message: "Not allowed" });

        caseObj.logs.push({ actorId, action: `${role} confirmed resolution`, timestamp: new Date() });

        // Check mutual closure
        if (caseObj.citizenAgree && caseObj.policeAgree) {
            caseObj.status = "Resolved";
            caseObj.logs.push({ actorId: null, action: "Case fully resolved", note: "Mutual closure achieved", timestamp: new Date() });
        }

        await caseObj.save();

        // Trigger notifications
        let alerts = [];
        if (role === "CITIZEN") alerts.push({ caseId: id, receiverId: caseObj.assignedOfficer, message: "Citizen confirmed resolution" });
        if (role === "POLICE") alerts.push({ caseId: id, receiverId: caseObj.citizenId, message: "Police confirmed resolution" });

        for (let a of alerts) {
            await Notification.create(a);
        }

        res.json({ message: "Resolution status updated", case: caseObj, alerts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- Severity Dashboard -------------------
exports.getDashboard = async (req, res) => {
    try {
        const { role, _id, stationId } = req.user;
        let filter = {};

        if (role === "CITIZEN") filter = { citizenId: _id };
        else if (role === "POLICE") filter = { assignedOfficer: _id };
        else if (role === "SUPERIOR") filter = { stationId };
        // Judiciary can see all

        const cases = await Case.find(filter).sort({ severityScore: -1 });
        const stats = {
            total: cases.length,
            critical: cases.filter(c => c.severityLevel === "CRITICAL").length,
            high: cases.filter(c => c.severityLevel === "HIGH").length,
            medium: cases.filter(c => c.severityLevel === "MEDIUM").length,
            low: cases.filter(c => c.severityLevel === "LOW").length,
            resolved: cases.filter(c => c.status === "Resolved").length
        };

        res.json({ stats, cases });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



// ------------------- Police marks case as handled -------------------
exports.markCaseHandled = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks, actionTaken } = req.body;
        const { _id: policeId, role } = req.user;

        if (role !== "POLICE") return res.status(403).json({ message: "Only police can mark case as handled" });

        const caseObj = await Case.findById(id);
        if (!caseObj) return res.status(404).json({ message: "Case not found" });

        // Update police action
        caseObj.policeAction = {
            acceptedAt: caseObj.policeAction?.acceptedAt || new Date(),
            attendedAt: new Date(),
            remarks: remarks || "",
            actionTaken: actionTaken || ""
        };

        // Log
        caseObj.logs.push({ actorId: policeId, action: "Police handled case", note: remarks, timestamp: new Date() });

        await caseObj.save();

        // Notify the citizen to confirm
        await Notification.create({
            recipientId: caseObj.reporter,
            caseId: caseObj._id,
            message: `Police has completed actions on your case: "${caseObj.crime_type}". Please confirm resolution.`
        });

        res.json({ message: "Case marked as handled by police", case: caseObj });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- Citizen confirms resolution -------------------
exports.confirmCaseResolved = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: citizenId, role } = req.user;

        if (role !== "CITIZEN") return res.status(403).json({ message: "Only citizens can confirm resolution" });

        const caseObj = await Case.findById(id);
        if (!caseObj) return res.status(404).json({ message: "Case not found" });

        caseObj.confirmed_by_citizen = true;

        // Mutual closure check
        if (caseObj.policeAction?.attendedAt && caseObj.confirmed_by_citizen) {
            caseObj.status = "RESOLVED";
            caseObj.logs.push({ actorId: null, action: "Case fully resolved", note: "Mutual closure achieved", timestamp: new Date() });
        }

        await caseObj.save();

        // Notify police about closure
        await Notification.create({
            recipientId: caseObj.assignedPolice,
            caseId: caseObj._id,
            message: `Citizen confirmed resolution for case: "${caseObj.crime_type}". Case is now resolved.`
        });

        res.json({ message: "Resolution confirmed by citizen", case: caseObj });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
